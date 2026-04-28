import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Condition, ConditionType, ConditionStatus } from '../../database/entities/condition.entity';
import { Deal } from '../../database/entities/deal.entity';
import { Document } from '../../database/entities/document.entity';

export interface EvaluationResult {
  conditionId: string;
  name: string;
  passed: boolean;
  reason?: string;
}

export interface SettlementGateResult {
  dealId: string;
  settlementAllowed: boolean;
  conditions: EvaluationResult[];
  blockers: string[];
}

/**
 * Condition Engine evaluates structured JSON rules against deal state.
 *
 * Rule types:
 *  BOOLEAN_FLAG      — a flag must be explicitly set on the condition
 *  DATE_DEADLINE     — a deadline must not have passed
 *  DOCUMENT_UPLOAD   — a verified document of the right type must exist
 *  EXTERNAL_CONFIRMATION — an external system (PEXA/DocuSign) must confirm
 *  APPROVAL          — one or more party roles must have approved
 */
@Injectable()
export class ConditionEngineService {
  private readonly logger = new Logger(ConditionEngineService.name);

  constructor(
    @InjectRepository(Condition) private readonly conditionsRepo: Repository<Condition>,
    @InjectRepository(Document) private readonly documentsRepo: Repository<Document>,
  ) {}

  async evaluateDeal(dealId: string): Promise<SettlementGateResult> {
    const conditions = await this.conditionsRepo.find({
      where: { deal: { id: dealId } },
      relations: ['deal'],
    });

    const results: EvaluationResult[] = await Promise.all(
      conditions.map((c) => this.evaluateCondition(c, dealId)),
    );

    const blockers = results.filter((r) => !r.passed).map((r) => r.reason || r.name);
    const settlementAllowed = blockers.length === 0;

    return { dealId, settlementAllowed, conditions: results, blockers };
  }

  async evaluateCondition(condition: Condition, dealId: string): Promise<EvaluationResult> {
    // Already met or waived — pass immediately
    if (condition.status === ConditionStatus.MET || condition.status === ConditionStatus.WAIVED) {
      return { conditionId: condition.id, name: condition.name, passed: true };
    }

    if (condition.status === ConditionStatus.FAILED) {
      return {
        conditionId: condition.id,
        name: condition.name,
        passed: false,
        reason: `${condition.name} has failed`,
      };
    }

    const rule = condition.ruleJson;

    switch (condition.conditionType) {
      case ConditionType.BOOLEAN_FLAG:
        return this.evaluateBooleanFlag(condition, rule);

      case ConditionType.DATE_DEADLINE:
        return this.evaluateDateDeadline(condition, rule);

      case ConditionType.DOCUMENT_UPLOAD:
        return this.evaluateDocumentUpload(condition, rule, dealId);

      case ConditionType.EXTERNAL_CONFIRMATION:
        return this.evaluateExternalConfirmation(condition, rule);

      case ConditionType.APPROVAL:
        return this.evaluateApproval(condition, rule);

      default:
        return { conditionId: condition.id, name: condition.name, passed: false, reason: 'Unknown condition type' };
    }
  }

  private evaluateBooleanFlag(condition: Condition, rule: any): EvaluationResult {
    // BOOLEAN_FLAG requires the condition to be explicitly marked MET
    // The rule describes what action is required; status drives the pass
    const passed = condition.status === ConditionStatus.MET;
    return {
      conditionId: condition.id,
      name: condition.name,
      passed,
      reason: passed ? undefined : `${condition.name} has not been confirmed yet`,
    };
  }

  private evaluateDateDeadline(condition: Condition, rule: any): EvaluationResult {
    const deadline = condition.dueDate ? new Date(condition.dueDate) : null;
    if (!deadline) {
      return { conditionId: condition.id, name: condition.name, passed: true };
    }
    const now = new Date();
    const passed = now <= deadline;
    return {
      conditionId: condition.id,
      name: condition.name,
      passed,
      reason: passed ? undefined : `${condition.name} deadline of ${deadline.toLocaleDateString('en-AU')} has passed`,
    };
  }

  private async evaluateDocumentUpload(
    condition: Condition,
    rule: any,
    dealId: string,
  ): Promise<EvaluationResult> {
    const requiredDocType = rule.required_doc_type;
    const verifiedRequired: boolean = rule.verified_required ?? false;

    const qb = this.documentsRepo
      .createQueryBuilder('doc')
      .where('doc.deal_id = :dealId', { dealId })
      .andWhere('doc.doc_type = :docType', { docType: requiredDocType })
      .andWhere('doc.deleted_at IS NULL');

    if (verifiedRequired) qb.andWhere('doc.verified = true');

    const doc = await qb.getOne();

    const passed = !!doc;
    return {
      conditionId: condition.id,
      name: condition.name,
      passed,
      reason: passed
        ? undefined
        : `${condition.name}: ${verifiedRequired ? 'verified ' : ''}document of type ${requiredDocType} not found`,
    };
  }

  private evaluateExternalConfirmation(condition: Condition, rule: any): EvaluationResult {
    // External systems set status directly via webhook handlers
    const passed = condition.status === ConditionStatus.MET;
    return {
      conditionId: condition.id,
      name: condition.name,
      passed,
      reason: passed ? undefined : `${condition.name}: awaiting external confirmation`,
    };
  }

  private evaluateApproval(condition: Condition, rule: any): EvaluationResult {
    // Approval conditions require the condition to be explicitly marked MET
    // by the required approver role (enforced in ConditionsService.markMet)
    const passed = condition.status === ConditionStatus.MET;
    return {
      conditionId: condition.id,
      name: condition.name,
      passed,
      reason: passed ? undefined : `${condition.name}: approval from ${rule.approvers?.join(', ') ?? 'required party'} pending`,
    };
  }
}

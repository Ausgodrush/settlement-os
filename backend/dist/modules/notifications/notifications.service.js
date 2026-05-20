"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bull_1 = require("@nestjs/bull");
const config_1 = require("@nestjs/config");
const notification_entity_1 = require("../../database/entities/notification.entity");
const deal_party_entity_1 = require("../../database/entities/deal-party.entity");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(notifRepo, partiesRepo, notifQueue, config) {
        this.notifRepo = notifRepo;
        this.partiesRepo = partiesRepo;
        this.notifQueue = notifQueue;
        this.config = config;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async send(dto) {
        const channels = dto.channels || [notification_entity_1.NotificationChannel.IN_APP, notification_entity_1.NotificationChannel.EMAIL];
        const notifications = channels.map((channel) => this.notifRepo.create({
            user: { id: dto.userId },
            deal: dto.dealId ? { id: dto.dealId } : undefined,
            title: dto.title,
            message: dto.message,
            channel,
            status: notification_entity_1.NotificationStatus.PENDING,
        }));
        const saved = await this.notifRepo.save(notifications);
        for (const notif of saved) {
            if (notif.channel !== notification_entity_1.NotificationChannel.IN_APP) {
                if (this.notifQueue) {
                    await this.notifQueue.add('send', { notificationId: notif.id }, { attempts: 3, backoff: 2000 });
                }
                else {
                    this.logger.log(`[Demo] Notification "${notif.title}" logged (no queue in demo mode)`);
                    notif.status = notification_entity_1.NotificationStatus.SENT;
                    notif.sentAt = new Date();
                    await this.notifRepo.save(notif);
                }
            }
        }
        return saved;
    }
    async notifyDealParties(dealId, payload) {
        const parties = await this.partiesRepo.find({
            where: { deal: { id: dealId }, isActive: true },
            relations: ['user'],
        });
        await Promise.all(parties.map((p) => this.send({
            userId: p.user.id,
            dealId,
            title: payload.title,
            message: payload.message,
            channels: [notification_entity_1.NotificationChannel.IN_APP, notification_entity_1.NotificationChannel.EMAIL],
        })));
    }
    async findForUser(userId) {
        const notifications = await this.notifRepo.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' },
            take: 50,
        });
        const unreadCount = notifications.filter((n) => !n.readAt).length;
        return { data: notifications, unreadCount };
    }
    async markRead(notificationId, userId) {
        const notif = await this.notifRepo.findOne({
            where: { id: notificationId, user: { id: userId } },
        });
        if (!notif)
            return null;
        notif.readAt = new Date();
        notif.status = notification_entity_1.NotificationStatus.READ;
        return this.notifRepo.save(notif);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(deal_party_entity_1.DealParty)),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, bull_1.InjectQueue)('notifications')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, Object, config_1.ConfigService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map
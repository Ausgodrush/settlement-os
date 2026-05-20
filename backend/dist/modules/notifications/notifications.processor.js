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
var NotificationsProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sgMail = require("@sendgrid/mail");
const notification_entity_1 = require("../../database/entities/notification.entity");
const user_entity_1 = require("../../database/entities/user.entity");
let NotificationsProcessor = NotificationsProcessor_1 = class NotificationsProcessor {
    constructor(notifRepo, usersRepo, config) {
        this.notifRepo = notifRepo;
        this.usersRepo = usersRepo;
        this.config = config;
        this.logger = new common_1.Logger(NotificationsProcessor_1.name);
        const apiKey = config.get('SENDGRID_API_KEY');
        if (apiKey)
            sgMail.setApiKey(apiKey);
    }
    async handleSend(job) {
        const { notificationId } = job.data;
        const notif = await this.notifRepo.findOne({
            where: { id: notificationId },
            relations: ['user'],
        });
        if (!notif)
            return;
        try {
            if (notif.channel === notification_entity_1.NotificationChannel.EMAIL) {
                await this.sendEmail(notif);
            }
            else if (notif.channel === notification_entity_1.NotificationChannel.SMS) {
                await this.sendSms(notif);
            }
            notif.status = notification_entity_1.NotificationStatus.SENT;
            notif.sentAt = new Date();
        }
        catch (err) {
            this.logger.error(`Failed to send notification ${notificationId}: ${err.message}`);
            notif.status = notification_entity_1.NotificationStatus.FAILED;
            notif.errorMsg = err.message;
        }
        await this.notifRepo.save(notif);
    }
    async sendEmail(notif) {
        const fromEmail = this.config.get('SENDGRID_FROM_EMAIL', 'noreply@settlement-os.com.au');
        const fromName = this.config.get('SENDGRID_FROM_NAME', 'Settlement OS');
        const user = notif.user;
        if (this.config.get('NODE_ENV') === 'development') {
            this.logger.log(`[Mock Email] To: ${user.email} | Subject: ${notif.title} | Body: ${notif.message}`);
            return;
        }
        await sgMail.send({
            to: user.email,
            from: { email: fromEmail, name: fromName },
            subject: notif.title,
            text: notif.message,
            html: `<p>${notif.message}</p>`,
        });
    }
    async sendSms(notif) {
        const user = notif.user;
        if (!user.phone)
            return;
        if (this.config.get('NODE_ENV') === 'development') {
            this.logger.log(`[Mock SMS] To: ${user.phone} | Message: ${notif.message}`);
            return;
        }
        const twilio = require('twilio');
        const client = twilio(this.config.get('TWILIO_ACCOUNT_SID'), this.config.get('TWILIO_AUTH_TOKEN'));
        const result = await client.messages.create({
            body: `Settlement OS: ${notif.message}`,
            from: this.config.get('TWILIO_FROM_NUMBER'),
            to: user.phone,
        });
        notif.providerId = result.sid;
    }
};
exports.NotificationsProcessor = NotificationsProcessor;
__decorate([
    (0, bull_1.Process)('send'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsProcessor.prototype, "handleSend", null);
exports.NotificationsProcessor = NotificationsProcessor = NotificationsProcessor_1 = __decorate([
    (0, bull_1.Processor)('notifications'),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], NotificationsProcessor);
//# sourceMappingURL=notifications.processor.js.map
package com.Rahul.taskify.Service;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Service.EmailService;
import com.Rahul.taskify.dto.ReminderMessage;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class ReminderConsumer {

    private static final Logger log = LoggerFactory.getLogger(ReminderConsumer.class);

    private final EmailService emailService;

    public ReminderConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    // ✅ This listens to the queue defined in application.properties
    @RabbitListener(queues = "${rabbitmq.reminder.queue}")
    public void consume(ReminderMessage message) {
        log.info("📥 Consumed reminder for task ID: {}", message.getTaskId());

        try {
            emailService.sendEmail(
                    message.getEmail(),
                    "⏰ Task Due Reminder: " + message.getTaskTitle(),
                    "Hello " + message.getUserName() + ",\n\n" +
                            "This is a reminder that your task:\n\n" +
                            "📌 " + message.getTaskTitle() + "\n" +
                            "🗓 Due Date: " + message.getDueDate() + "\n\n" +
                            "Please make sure to complete it on time.\n\n" +
                            "Regards,\nTaskify Bot 🤖"
            );
            log.info("✅ Email sent for task ID: {}", message.getTaskId());
        } catch (MessagingException e) {
            log.error("❌ Failed to send email for task ID: {}", message.getTaskId(), e);
        }
    }
}

package com.Rahul.taskify.Service;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.TaskRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;

@Component
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmailService emailService;

    // Runs every day at 8 AM IST (configurable via application.properties)
    @Scheduled(cron = "${reminder.cron}", zone = "${reminder.zone}")
    public void sendTaskReminders() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        List<Task> upcomingTasks = taskRepository.findAll();

        for (Task task : upcomingTasks) {
            if (task.getDueDate() == null || task.isCompleted()) continue;

            LocalDate dueDate = task.getDueDate().toLocalDate();
            if (dueDate.isEqual(today) || dueDate.isEqual(tomorrow)) {
                User assignedUser = task.getAssignedTo();
                if (assignedUser != null && assignedUser.getEmail() != null) {
                    String subject = "⏰ Task Due Reminder: " + task.getTitle();
                    String body = "Hello " + assignedUser.getUserName() + ",\n\n" +
                            "This is a reminder that your task:\n\n" +
                            "📌 **" + task.getTitle() + "**\n" +
                            "🗓 Due Date: " + dueDate + "\n\n" +
                            "Please make sure to complete it on time.\n\n" +
                            "Regards,\nTaskify Bot 🤖";

                    try {
                        emailService.sendEmail(assignedUser.getEmail(), subject, body);
                        log.info("✅ Reminder sent for task ID: {}", task.getId());
                    } catch (MessagingException e) {
                        log.error("❌ Failed to send email for task ID: {}", task.getId(), e);
                    }
                }
            }
        }
    }
}

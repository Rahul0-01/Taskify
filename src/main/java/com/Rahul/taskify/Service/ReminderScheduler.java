package com.Rahul.taskify.Service;

import com.Rahul.taskify.Model.Task;
import com.Rahul.taskify.Model.User;
import com.Rahul.taskify.Repository.TaskRepository;
import com.Rahul.taskify.dto.ReminderMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.reminder.exchange}")
    private String reminderExchange;

    @Value("${rabbitmq.reminder.routing-key}")
    private String reminderRoutingKey;

    // Runs every day at 8 AM IST
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

                    // ✅ Include taskId in the message now
                    ReminderMessage message = new ReminderMessage(
                            task.getId(),
                            assignedUser.getEmail(),
                            assignedUser.getUserName(),
                            task.getTitle(),
                            dueDate.toString()
                    );

                    // Publish to RabbitMQ
                    rabbitTemplate.convertAndSend(reminderExchange, reminderRoutingKey, message);
                    log.info("📤 Reminder enqueued for task ID: {}", task.getId());
                }
            }
        }
    }
}

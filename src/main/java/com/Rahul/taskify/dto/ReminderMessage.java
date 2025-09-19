package com.Rahul.taskify.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor // ✅ Convenience constructor
public class ReminderMessage implements Serializable {
    private Long taskId;
    private String email;
    private String userName;
    private String taskTitle;
    private String dueDate;
}

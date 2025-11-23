package com.Rahul.taskify.Configuration;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Profile("!prod")//to disable it for production(deploying)
@Configuration
public class RabbitMQConfig {

    @Value("${rabbitmq.reminder.queue}")
    private String reminderQueue;

    @Value("${rabbitmq.reminder.exchange}")
    private String reminderExchange;

    @Value("${rabbitmq.reminder.routing-key}")
    private String reminderRoutingKey;

    @Bean
    public Queue queue() {
        return new Queue(reminderQueue, true);
    }

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(reminderExchange);
    }

    @Bean
    public Binding binding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(reminderRoutingKey);
    }

    // ✅ JSON converter for producer + consumer
    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jackson2JsonMessageConverter());
        return template;
    }
}

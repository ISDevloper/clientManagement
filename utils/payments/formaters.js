export const formatPayements = (payements) => {
  return payements.map((payement) => {
    return {
      id: payement.id,
      number: payement.project_name,
      amount: payement.amount,
      dueDate: payement.due_date,
      status: payement.status,
      project: payement.project_name,
      department: payement.service,
      reminders: payement.reminders.map((reminder) => {
        return {
          id: reminder.id,
          comment: reminder.comment,
          type: reminder.type,
          created_at: reminder.created_at,
          target: {
            name: reminder.sent_by.full_name,
            email: reminder.sent_by.email,
            phone: reminder.sent_by.phone,
            departement: reminder.sent_by.departement,
          },
        };
      }),
    };
  });
};

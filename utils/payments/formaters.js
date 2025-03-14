export const formatPayements = (payement) => {
  return payement.map((payement) => {
    return {
      id: payement.id,
      number: payement.project_name,
      amount: payement.amount,
      dueDate: payement.due_date,
      status: payement.status,
      project: payement.project_name,
      department: payement.service,
      reminders: payement.payement_reminder.map((reminder) => {
        return {
          id: reminder.id,
          comment: reminder.comment,
          target: {
            name: reminder.profiles.full_name,
            phone: reminder.profiles.phone,
            department: reminder.profiles.company,
            created_at: reminder.profiles.created_at,
          },
        };
      }),
    };
  });
};

import React from 'react';

const PrincipalView = () => {
  return (
    <div className="container">
      <h2>Principal’s Panel</h2>
      <p>This view is exclusive to the Principal (or roles with principal-level access).</p>
      <ul>
        <li>Approve or review teacher schedules.</li>
        <li>Analyze student performance metrics.</li>
        <li>Manage exam schedules & syllabus deadlines.</li>
      </ul>
    </div>
  );
};

export default PrincipalView;

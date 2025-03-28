/**
 * Validates the structure of mock data
 * @param {Object} data - The mock data to validate
 * @returns {Object} - Object with validation result and any error messages
 */
export function validateMockData(data) {
  const errors = [];
  
  // Required top-level keys
  const requiredKeys = [
    'dash_jwt_secret',
    'git_encryption_key',
    'user_store',
    'team_store',
    'project_store'
  ];
  
  // Check required keys exist
  requiredKeys.forEach(key => {
    if (!(key in data)) {
      errors.push(`Missing required key: ${key}`);
    }
  });

  // Validate user store structure if it exists
  if (data['mock-user-store']) {
    Object.entries(data['mock-user-store']).forEach(([userId, user]) => {
      if (!user.username) errors.push(`User ${userId} missing username`);
      if (!user.password) errors.push(`User ${userId} missing password`);
      if (!Array.isArray(user.teams)) {
        errors.push(`User ${userId} teams must be an array`);
      } else {
        user.teams.forEach((team, index) => {
          if (!team.id) errors.push(`User ${userId} team ${index} missing id`);
          if (!team.role) errors.push(`User ${userId} team ${index} missing role`);
          if (!team.joined_at) errors.push(`User ${userId} team ${index} missing joined_at`);
        });
      }
    });
  }

  // Validate team store structure if it exists
  if (data['mock-team-store']) {
    Object.entries(data['mock-team-store']).forEach(([teamId, team]) => {
      if (!team.name) errors.push(`Team ${teamId} missing name`);
      if (!team.owner) errors.push(`Team ${teamId} missing owner`);
      if (!Array.isArray(team.members)) {
        errors.push(`Team ${teamId} members must be an array`);
      }
      if (!Array.isArray(team.projects)) {
        errors.push(`Team ${teamId} projects must be an array`);
      }
      if (!team.created_at) errors.push(`Team ${teamId} missing created_at`);
    });
  }

  // Validate project store structure if it exists
  if (data['mock-project-store']) {
    Object.entries(data['mock-project-store']).forEach(([projectId, project]) => {
      if (!project.name) errors.push(`Project ${projectId} missing name`);
      if (!project.team) errors.push(`Project ${projectId} missing team`);
      if (!project.created_at) errors.push(`Project ${projectId} missing created_at`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 
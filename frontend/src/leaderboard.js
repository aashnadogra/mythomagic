document.addEventListener('DOMContentLoaded', () => {
    const leaderboardTable = document.querySelector('#leaderboardTable tbody');
    const refreshBtn = document.getElementById('refreshBtn');
  
    // Function to fetch leaderboard data and update the table
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        updateLeaderboardTable(data);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    };
  
    // Function to update the leaderboard table
    const updateLeaderboardTable = (data) => {
      leaderboardTable.innerHTML = ''; // Clear the table
  
      data.forEach((player) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${player.rank}</td>
          <td>${player.username}</td>
          <td>${player.wins}</td>
          <td>${player.losses}</td>
        `;
        leaderboardTable.appendChild(row);
      });
    };
  
    // Refresh button functionality
    refreshBtn.addEventListener('click', fetchLeaderboard);
  
    // Initial fetch
    fetchLeaderboard();
  });
  
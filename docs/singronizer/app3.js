// Application data
const platformData = {
  platforms: [
    {id: "spotify", name: "Spotify", color: "#1DB954"},
    {id: "apple_music", name: "Apple Music", color: "#FA243C"},
    {id: "youtube_music", name: "YouTube Music", color: "#FF0000"},
    {id: "deezer", name: "Deezer", color: "#FEAA2D"},
    {id: "soundcloud", name: "SoundCloud", color: "#FF3300"},
    {id: "tidal", name: "TIDAL", color: "#000000"}
  ],
  sample_playlists: {
    spotify: [
      {
        id: "1",
        name: "My Workout Mix",
        song_count: 25,
        songs: [
          {title: "Stronger", artist: "Kanye West"},
          {title: "Pump It", artist: "The Black Eyed Peas"},
          {title: "Till I Collapse", artist: "Eminem"},
          {title: "Eye of the Tiger", artist: "Survivor"},
          {title: "Thunder", artist: "Imagine Dragons"}
        ]
      },
      {
        id: "2", 
        name: "Chill Vibes",
        song_count: 18,
        songs: [
          {title: "Stay", artist: "Rihanna"},
          {title: "Breathe Me", artist: "Sia"},
          {title: "Mad World", artist: "Gary Jules"},
          {title: "The Night We Met", artist: "Lord Huron"},
          {title: "Skinny Love", artist: "Bon Iver"}
        ]
      },
      {
        id: "3",
        name: "Road Trip Classics",
        song_count: 32,
        songs: [
          {title: "Don't Stop Believin'", artist: "Journey"},
          {title: "Sweet Child O' Mine", artist: "Guns N' Roses"},
          {title: "Bohemian Rhapsody", artist: "Queen"},
          {title: "Hotel California", artist: "Eagles"},
          {title: "Livin' on a Prayer", artist: "Bon Jovi"}
        ]
      }
    ],
    apple_music: [
      {
        id: "4",
        name: "Focus Deep",
        song_count: 22,
        songs: [
          {title: "Weightless", artist: "Marconi Union"},
          {title: "Clair de Lune", artist: "Claude Debussy"},
          {title: "Gymnopédie No. 1", artist: "Erik Satie"},
          {title: "Spiegel im Spiegel", artist: "Arvo Pärt"},
          {title: "On Earth as It Is in Heaven", artist: "Ólafur Arnalds"}
        ]
      },
      {
        id: "5",
        name: "Party Hits",
        song_count: 28,
        songs: [
          {title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars"},
          {title: "Can't Stop the Feeling!", artist: "Justin Timberlake"},
          {title: "Happy", artist: "Pharrell Williams"},
          {title: "Shake It Off", artist: "Taylor Swift"},
          {title: "Good as Hell", artist: "Lizzo"}
        ]
      }
    ],
    youtube_music: [
      {
        id: "6",
        name: "Indie Discoveries", 
        song_count: 19,
        songs: [
          {title: "Electric Feel", artist: "MGMT"},
          {title: "Two Weeks", artist: "FKA twigs"},
          {title: "Midnight City", artist: "M83"},
          {title: "Tame", artist: "Pixies"},
          {title: "Young Folks", artist: "Peter Bjorn and John"}
        ]
      }
    ],
    deezer: [
      {
        id: "7",
        name: "Electronic Beats",
        song_count: 15,
        songs: [
          {title: "One More Time", artist: "Daft Punk"},
          {title: "Strobe", artist: "Deadmau5"},
          {title: "Satisfaction", artist: "Benny Benassi"},
          {title: "Levels", artist: "Avicii"},
          {title: "Clarity", artist: "Zedd"}
        ]
      }
    ],
    soundcloud: [
      {
        id: "8",
        name: "Underground Hip-Hop",
        song_count: 12,
        songs: [
          {title: "Chum", artist: "Earl Sweatshirt"},
          {title: "White Ferrari", artist: "Frank Ocean"},
          {title: "DNA", artist: "Kendrick Lamar"},
          {title: "The Recipe", artist: "Kendrick Lamar"},
          {title: "Pyramids", artist: "Frank Ocean"}
        ]
      }
    ],
    tidal: [
      {
        id: "9",
        name: "Jazz Standards",
        song_count: 20,
        songs: [
          {title: "Take Five", artist: "Dave Brubeck"},
          {title: "Kind of Blue", artist: "Miles Davis"},
          {title: "A Love Supreme", artist: "John Coltrane"},
          {title: "Blue in Green", artist: "Miles Davis"},
          {title: "Giant Steps", artist: "John Coltrane"}
        ]
      }
    ]
  }
};

// Application state
let currentTheme = 'light';
let sourcePlatform = '';
let targetPlatform = '';
let transferredPlaylists = [];

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  initializeApp();
});

function initializeApp() {
  initializeTheme();
  setupEventListeners();
  updateTransferButton();
  console.log('App initialized successfully');
}

// Theme management
function initializeTheme() {
  // Check for system preference
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  currentTheme = prefersDark ? 'dark' : 'light';
  applyTheme();
  console.log('Theme initialized:', currentTheme);
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme();
  console.log('Theme toggled to:', currentTheme);
}

function applyTheme() {
  document.documentElement.setAttribute('data-color-scheme', currentTheme);
  
  const sunIcon = document.querySelector('.theme-icon--sun');
  const moonIcon = document.querySelector('.theme-icon--moon');
  
  if (currentTheme === 'dark') {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  } else {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
}

// Event listeners
function setupEventListeners() {
  const themeToggle = document.getElementById('themeToggle');
  const sourcePlatformSelect = document.getElementById('sourcePlatform');
  const targetPlatformSelect = document.getElementById('targetPlatform');
  const transferBtn = document.getElementById('transferBtn');

  if (themeToggle) {
    themeToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleTheme();
    });
  }
  
  if (sourcePlatformSelect) {
    sourcePlatformSelect.addEventListener('change', function(e) {
      sourcePlatform = e.target.value;
      console.log('Source platform changed to:', sourcePlatform);
      loadSourcePlaylists();
      updateTransferButton();
    });
  }
  
  if (targetPlatformSelect) {
    targetPlatformSelect.addEventListener('change', function(e) {
      targetPlatform = e.target.value;
      console.log('Target platform changed to:', targetPlatform);
      loadTargetPlaylists();
      updateTransferButton();
    });
  }
  
  if (transferBtn) {
    transferBtn.addEventListener('click', function(e) {
      e.preventDefault();
      handleTransfer();
    });
  }

  console.log('Event listeners setup complete');
}

// Playlist management
function loadSourcePlaylists() {
  const sourcePlaylistsContainer = document.getElementById('sourcePlaylists');
  
  if (!sourcePlaylistsContainer) return;
  
  if (!sourcePlatform) {
    sourcePlaylistsContainer.innerHTML = '<div class="empty-state"><p>Select a source platform to view playlists</p></div>';
    return;
  }
  
  const playlists = platformData.sample_playlists[sourcePlatform] || [];
  
  if (playlists.length === 0) {
    sourcePlaylistsContainer.innerHTML = '<div class="empty-state"><p>No playlists available for this platform</p></div>';
    return;
  }
  
  sourcePlaylistsContainer.innerHTML = playlists.map(playlist => createPlaylistHTML(playlist)).join('');
  setupAccordionListeners();
  console.log('Source playlists loaded:', playlists.length);
}

function loadTargetPlaylists() {
  const targetPlaylistsContainer = document.getElementById('targetPlaylists');
  
  if (!targetPlaylistsContainer) return;
  
  if (!targetPlatform) {
    targetPlaylistsContainer.innerHTML = '<div class="empty-state"><p>Select a target platform to start transferring</p></div>';
    return;
  }
  
  if (transferredPlaylists.length === 0) {
    targetPlaylistsContainer.innerHTML = '<div class="empty-state"><p>No transferred playlists yet</p></div>';
    return;
  }
  
  targetPlaylistsContainer.innerHTML = transferredPlaylists.map(playlist => createPlaylistHTML(playlist)).join('');
  setupAccordionListeners();
  console.log('Target playlists loaded:', transferredPlaylists.length);
}

function createPlaylistHTML(playlist) {
  return `
    <div class="playlist-item" data-playlist-id="${playlist.id}">
      <div class="playlist-header" tabindex="0" role="button" aria-expanded="false">
        <div class="playlist-info">
          <h3>${playlist.name}</h3>
          <p class="song-count">${playlist.song_count} songs</p>
        </div>
        <svg class="playlist-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
      <div class="playlist-content">
        <div class="songs-list">
          ${playlist.songs.map(song => `
            <div class="song-item">
              <span class="song-title">${song.title}</span> - ${song.artist}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function setupAccordionListeners() {
  const playlistHeaders = document.querySelectorAll('.playlist-header');
  
  playlistHeaders.forEach(header => {
    // Remove existing listeners to avoid duplicates
    header.removeEventListener('click', togglePlaylist);
    header.removeEventListener('keydown', handleKeydown);
    
    // Add new listeners
    header.addEventListener('click', togglePlaylist);
    header.addEventListener('keydown', handleKeydown);
  });
}

function handleKeydown(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    togglePlaylist.call(this, e);
  }
}

function togglePlaylist(e) {
  const playlistItem = e.target.closest('.playlist-item');
  if (!playlistItem) return;
  
  const isExpanded = playlistItem.classList.contains('expanded');
  const header = playlistItem.querySelector('.playlist-header');
  
  // Close all other playlists
  document.querySelectorAll('.playlist-item.expanded').forEach(item => {
    if (item !== playlistItem) {
      item.classList.remove('expanded');
      const otherHeader = item.querySelector('.playlist-header');
      if (otherHeader) {
        otherHeader.setAttribute('aria-expanded', 'false');
      }
    }
  });
  
  // Toggle current playlist
  if (isExpanded) {
    playlistItem.classList.remove('expanded');
    header.setAttribute('aria-expanded', 'false');
  } else {
    playlistItem.classList.add('expanded');
    header.setAttribute('aria-expanded', 'true');
  }
  
  console.log('Playlist toggled:', playlistItem.dataset.playlistId);
}

// Transfer functionality
function updateTransferButton() {
  const transferBtn = document.getElementById('transferBtn');
  if (!transferBtn) return;
  
  const canTransfer = sourcePlatform && targetPlatform && sourcePlatform !== targetPlatform;
  transferBtn.disabled = !canTransfer;
  
  if (canTransfer) {
    transferBtn.classList.remove('btn--outline');
    transferBtn.classList.add('btn--primary');
  } else {
    transferBtn.classList.remove('btn--primary');
    transferBtn.classList.add('btn--outline');
  }
  
  console.log('Transfer button updated. Can transfer:', canTransfer);
}

async function handleTransfer() {
  if (!sourcePlatform || !targetPlatform) return;
  
  const transferBtn = document.getElementById('transferBtn');
  const transferProgress = document.getElementById('transferProgress');
  
  // Show loading state
  if (transferBtn) transferBtn.style.display = 'none';
  if (transferProgress) transferProgress.classList.remove('hidden');
  
  console.log('Starting transfer from', sourcePlatform, 'to', targetPlatform);
  
  try {
    // Simulate transfer process
    await simulateTransfer();
    
    // Get source playlists and transfer them
    const sourcePlaylists = platformData.sample_playlists[sourcePlatform] || [];
    transferredPlaylists = [...sourcePlaylists];
    
    // Update target playlists
    loadTargetPlaylists();
    
    // Show success message
    showSuccessMessage();
    
    console.log('Transfer completed successfully');
    
  } catch (error) {
    console.error('Transfer failed:', error);
  } finally {
    // Hide loading state
    if (transferProgress) transferProgress.classList.add('hidden');
    if (transferBtn) transferBtn.style.display = 'flex';
  }
}

function simulateTransfer() {
  return new Promise(resolve => {
    setTimeout(resolve, 2500);
  });
}

function showSuccessMessage() {
  const successMessage = document.getElementById('successMessage');
  if (!successMessage) return;
  
  successMessage.classList.remove('hidden');
  successMessage.classList.add('show');
  
  setTimeout(() => {
    successMessage.classList.remove('show');
    setTimeout(() => {
      successMessage.classList.add('hidden');
    }, 300);
  }, 3000);
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  // ESC to close expanded playlists
  if (e.key === 'Escape') {
    document.querySelectorAll('.playlist-item.expanded').forEach(item => {
      item.classList.remove('expanded');
      const header = item.querySelector('.playlist-header');
      if (header) {
        header.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
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
        song_count: 5,
        songs: [
          {
            title: "Stronger",
            artist: "Kanye West",
            album: "Graduation",
            duration: "5:11",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Pump It",
            artist: "The Black Eyed Peas",
            album: "Monkey Business",
            duration: "3:33",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Till I Collapse",
            artist: "Eminem",
            album: "The Eminem Show",
            duration: "4:57",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Eye of the Tiger",
            artist: "Survivor",
            album: "Eye of the Tiger",
            duration: "4:04",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Thunder",
            artist: "Imagine Dragons",
            album: "Evolve",
            duration: "3:07",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          }
        ]
      },
      {
        id: "2",
        name: "Chill Vibes",
        song_count: 5,
        songs: [
          {
            title: "Stay",
            artist: "Rihanna",
            album: "Unapologetic",
            duration: "4:00",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Breathe Me",
            artist: "Sia",
            album: "Colour the Small One",
            duration: "4:31",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Mad World",
            artist: "Gary Jules",
            album: "Trading Snakeoil for Wolftickets",
            duration: "3:07",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "The Night We Met",
            artist: "Lord Huron",
            album: "Strange Trails",
            duration: "4:18",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Skinny Love",
            artist: "Bon Iver",
            album: "For Emma, Forever Ago",
            duration: "3:58",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          }
        ]
      },
      {
        id: "3",
        name: "Road Trip Classics",
        song_count: 5,
        songs: [
          {
            title: "Don't Stop Believin'",
            artist: "Journey",
            album: "Escape",
            duration: "4:20",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Sweet Child O' Mine",
            artist: "Guns N' Roses",
            album: "Appetite for Destruction",
            duration: "5:03",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Bohemian Rhapsody",
            artist: "Queen",
            album: "A Night at the Opera",
            duration: "5:55",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Hotel California",
            artist: "Eagles",
            album: "Hotel California",
            duration: "6:30",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          },
          {
            title: "Livin' on a Prayer",
            artist: "Bon Jovi",
            album: "Slippery When Wet",
            duration: "4:09",
            albumArt: "https://via.placeholder.com/40x40/1DB954/ffffff?text=♪"
          }
        ]
      }
    ],
    apple_music: [
      {
        id: "4",
        name: "Focus Deep",
        song_count: 5,
        songs: [
          {
            title: "Weightless",
            artist: "Marconi Union",
            album: "Distance",
            duration: "8:08",
            albumArt: "https://via.placeholder.com/40x40/FA243C/ffffff?text=♪"
          },
          {
            title: "Clair de Lune",
            artist: "Claude Debussy",
            album: "Suite bergamasque",
            duration: "4:42",
            albumArt: "https://via.placeholder.com/40x40/FA243C/ffffff?text=♪"
          },
          {
            title: "Gymnopédie No. 1",
            artist: "Erik Satie",
            album: "Gymnopédies",
            duration: "4:20",
            albumArt: "https://via.placeholder.com/40x40/FA243C/ffffff?text=♪"
          },
          {
            title: "Spiegel im Spiegel",
            artist: "Arvo Pärt",
            album: "Tabula Rasa",
            duration: "8:00",
            albumArt: "https://via.placeholder.com/40x40/FA243C/ffffff?text=♪"
          },
          {
            title: "On Earth as It Is in Heaven",
            artist: "Ólafur Arnalds",
            album: "Re:member",
            duration: "4:45",
            albumArt: "https://via.placeholder.com/40x40/FA243C/ffffff?text=♪"
          }
        ]
      }
    ],
    youtube_music: [
      {
        id: "6",
        name: "Indie Discoveries",
        song_count: 5,
        songs: [
          {
            title: "Electric Feel",
            artist: "MGMT",
            album: "Oracular Spectacular",
            duration: "3:49",
            albumArt: "https://via.placeholder.com/40x40/FF0000/ffffff?text=♪"
          },
          {
            title: "Two Weeks",
            artist: "FKA twigs",
            album: "LP1",
            duration: "4:04",
            albumArt: "https://via.placeholder.com/40x40/FF0000/ffffff?text=♪"
          },
          {
            title: "Midnight City",
            artist: "M83",
            album: "Hurry Up, We're Dreaming",
            duration: "4:03",
            albumArt: "https://via.placeholder.com/40x40/FF0000/ffffff?text=♪"
          },
          {
            title: "Tame",
            artist: "Pixies",
            album: "Doolittle",
            duration: "1:55",
            albumArt: "https://via.placeholder.com/40x40/FF0000/ffffff?text=♪"
          },
          {
            title: "Young Folks",
            artist: "Peter Bjorn and John",
            album: "Writer's Block",
            duration: "4:40",
            albumArt: "https://via.placeholder.com/40x40/FF0000/ffffff?text=♪"
          }
        ]
      }
    ],
    deezer: [
      {
        id: "7",
        name: "Electronic Vibes",
        song_count: 5,
        songs: [
          {
            title: "Strobe",
            artist: "Deadmau5",
            album: "For Lack of a Better Name",
            duration: "10:32",
            albumArt: "https://via.placeholder.com/40x40/FEAA2D/ffffff?text=♪"
          },
          {
            title: "Breathe",
            artist: "The Prodigy",
            album: "The Fat of the Land",
            duration: "5:34",
            albumArt: "https://via.placeholder.com/40x40/FEAA2D/ffffff?text=♪"
          },
          {
            title: "Around the World",
            artist: "Daft Punk",
            album: "Homework",
            duration: "7:09",
            albumArt: "https://via.placeholder.com/40x40/FEAA2D/ffffff?text=♪"
          },
          {
            title: "Bangarang",
            artist: "Skrillex",
            album: "Bangarang",
            duration: "3:35",
            albumArt: "https://via.placeholder.com/40x40/FEAA2D/ffffff?text=♪"
          },
          {
            title: "Animals",
            artist: "Martin Garrix",
            album: "Animals",
            duration: "5:05",
            albumArt: "https://via.placeholder.com/40x40/FEAA2D/ffffff?text=♪"
          }
        ]
      }
    ],
    soundcloud: [
      {
        id: "8",
        name: "Underground Beats",
        song_count: 5,
        songs: [
          {
            title: "Forest",
            artist: "System Of A Down",
            album: "Toxicity",
            duration: "4:00",
            albumArt: "https://via.placeholder.com/40x40/FF3300/ffffff?text=♪"
          },
          {
            title: "Aruarian Dance",
            artist: "Nujabes",
            album: "Modal Soul",
            duration: "5:14",
            albumArt: "https://via.placeholder.com/40x40/FF3300/ffffff?text=♪"
          },
          {
            title: "Do The Astral Plane",
            artist: "Flying Lotus",
            album: "Los Angeles",
            duration: "4:28",
            albumArt: "https://via.placeholder.com/40x40/FF3300/ffffff?text=♪"
          },
          {
            title: "Donuts (Outro)",
            artist: "J Dilla",
            album: "Donuts",
            duration: "1:24",
            albumArt: "https://via.placeholder.com/40x40/FF3300/ffffff?text=♪"
          },
          {
            title: "Accordion",
            artist: "MF DOOM",
            album: "Madvillainy",
            duration: "1:59",
            albumArt: "https://via.placeholder.com/40x40/FF3300/ffffff?text=♪"
          }
        ]
      }
    ],
    tidal: [
      {
        id: "9",
        name: "Hi-Fi Classics",
        song_count: 5,
        songs: [
          {
            title: "Speak to Me",
            artist: "Pink Floyd",
            album: "The Dark Side of the Moon",
            duration: "1:13",
            albumArt: "https://via.placeholder.com/40x40/000000/ffffff?text=♪"
          },
          {
            title: "So What",
            artist: "Miles Davis",
            album: "Kind of Blue",
            duration: "9:22",
            albumArt: "https://via.placeholder.com/40x40/000000/ffffff?text=♪"
          },
          {
            title: "What's Going On",
            artist: "Marvin Gaye",
            album: "What's Going On",
            duration: "3:53",
            albumArt: "https://via.placeholder.com/40x40/000000/ffffff?text=♪"
          },
          {
            title: "Wouldn't It Be Nice",
            artist: "The Beach Boys",
            album: "Pet Sounds",
            duration: "2:23",
            albumArt: "https://via.placeholder.com/40x40/000000/ffffff?text=♪"
          },
          {
            title: "Paranoid Android",
            artist: "Radiohead",
            album: "OK Computer",
            duration: "6:23",
            albumArt: "https://via.placeholder.com/40x40/000000/ffffff?text=♪"
          }
        ]
      }
    ]
  }
};

// Application state
let currentTheme = 'light';
let sourcePlatform = '';
let targetPlatform = '';
let selectedPlaylistId = null;
let transferredPlaylist = null;

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
      handlePlatformChange('source', e.target.value);
    });
  }
  
  if (targetPlatformSelect) {
    targetPlatformSelect.addEventListener('change', function(e) {
      handlePlatformChange('target', e.target.value);
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

// Platform loading with 2-second delay
async function handlePlatformChange(type, platformValue) {
  if (type === 'source') {
    sourcePlatform = platformValue;
    selectedPlaylistId = null; // Clear selection when platform changes
    console.log('Source platform changed to:', sourcePlatform);
  } else {
    targetPlatform = platformValue;
    console.log('Target platform changed to:', targetPlatform);
  }
  
  if (platformValue) {
    // Show loading state
    showLoadingState(type);
    
    // Wait 2 seconds
    await simulateLoading(2000);
    
    // Hide loading state
    hideLoadingState(type);
    
    // Load content
    if (type === 'source') {
      loadSourcePlaylists();
    } else {
      loadTargetPlaylists();
    }
  } else {
    // No platform selected, just load empty state
    if (type === 'source') {
      loadSourcePlaylists();
    } else {
      loadTargetPlaylists();
    }
  }
  
  updateTransferButton();
}

function showLoadingState(type) {
  const column = document.getElementById(type + 'Column');
  const loading = document.getElementById(type + 'Loading');
  
  if (column && loading) {
    column.classList.add('loading');
    loading.classList.remove('hidden');
  }
}

function hideLoadingState(type) {
  const column = document.getElementById(type + 'Column');
  const loading = document.getElementById(type + 'Loading');
  
  if (column && loading) {
    column.classList.remove('loading');
    loading.classList.add('hidden');
  }
}

function simulateLoading(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
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
  
  sourcePlaylistsContainer.innerHTML = playlists.map(playlist => createPlaylistHTML(playlist, true)).join('');
  setupPlaylistEventListeners();
  console.log('Source playlists loaded:', playlists.length);
}

function loadTargetPlaylists() {
  const targetPlaylistsContainer = document.getElementById('targetPlaylists');
  
  if (!targetPlaylistsContainer) return;
  
  if (!targetPlatform) {
    targetPlaylistsContainer.innerHTML = '<div class="empty-state"><p>Select a target platform to start transferring</p></div>';
    return;
  }
  
  if (!transferredPlaylist) {
    targetPlaylistsContainer.innerHTML = '<div class="empty-state"><p>No playlists transferred yet</p></div>';
    return;
  }
  
  targetPlaylistsContainer.innerHTML = createPlaylistHTML(transferredPlaylist, false);
  setupAccordionListeners();
  console.log('Target playlist loaded:', transferredPlaylist.name);
}

function createPlaylistHTML(playlist, includeRadio = false) {
  const isSelected = selectedPlaylistId === playlist.id;
  
  return `
    <div class="playlist-item ${isSelected ? 'selected' : ''}" data-playlist-id="${playlist.id}">
      ${isSelected ? '<div class="selected-indicator">Selected</div>' : ''}
      <div class="playlist-selection">
        ${includeRadio ? `
          <input type="radio" 
                 class="playlist-radio" 
                 name="playlist-selection" 
                 value="${playlist.id}"
                 ${isSelected ? 'checked' : ''}
                 id="playlist-${playlist.id}">
        ` : ''}
        <div class="playlist-content-wrapper">
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
              ${playlist.songs.map(song => createSongHTML(song)).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function createSongHTML(song) {
  return `
    <div class="song-item">
      <div class="song-album-art">
        <img src="${song.albumArt}" alt="${song.album}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div style="display: none; color: var(--color-text-secondary); font-size: 16px;">♪</div>
      </div>
      <div class="song-details">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}</div>
        <div class="song-album">${song.album}</div>
      </div>
      <div class="song-duration">${song.duration}</div>
    </div>
  `;
}

function setupPlaylistEventListeners() {
  // Setup radio button listeners
  const radioButtons = document.querySelectorAll('.playlist-radio');
  radioButtons.forEach(radio => {
    radio.addEventListener('change', handlePlaylistSelection);
  });
  
  // Setup accordion listeners
  setupAccordionListeners();
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

function handlePlaylistSelection(e) {
  const playlistId = e.target.value;
  const wasSelected = selectedPlaylistId === playlistId;
  
  // Update selected playlist ID
  selectedPlaylistId = wasSelected ? null : playlistId;
  
  console.log('Playlist selection changed:', selectedPlaylistId);
  
  // Update visual states
  updatePlaylistVisualStates();
  updateTransferButton();
}

function updatePlaylistVisualStates() {
  const playlistItems = document.querySelectorAll('#sourcePlaylists .playlist-item');
  
  playlistItems.forEach(item => {
    const playlistId = item.dataset.playlistId;
    const isSelected = selectedPlaylistId === playlistId;
    const radio = item.querySelector('.playlist-radio');
    
    // Update item visual state
    if (isSelected) {
      item.classList.add('selected');
      if (!item.querySelector('.selected-indicator')) {
        item.insertAdjacentHTML('afterbegin', '<div class="selected-indicator">Selected</div>');
      }
    } else {
      item.classList.remove('selected');
      const indicator = item.querySelector('.selected-indicator');
      if (indicator) {
        indicator.remove();
      }
    }
    
    // Update radio button
    if (radio) {
      radio.checked = isSelected;
    }
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
  const transferText = document.querySelector('.transfer-text');
  if (!transferBtn || !transferText) return;
  
  const canTransfer = sourcePlatform && targetPlatform && sourcePlatform !== targetPlatform && selectedPlaylistId;
  transferBtn.disabled = !canTransfer;
  
  // Update button text based on state
  if (!sourcePlatform || !targetPlatform) {
    transferText.textContent = 'Select platforms';
  } else if (sourcePlatform === targetPlatform) {
    transferText.textContent = 'Select different platforms';
  } else if (!selectedPlaylistId) {
    transferText.textContent = 'Select playlist to transfer';
  } else {
    const selectedPlaylist = getSelectedPlaylist();
    if (selectedPlaylist) {
      transferText.textContent = `Transfer "${selectedPlaylist.name}"`;
    } else {
      transferText.textContent = 'Transfer Selected Playlist';
    }
  }
  
  console.log('Transfer button updated. Can transfer:', canTransfer);
}

function getSelectedPlaylist() {
  if (!selectedPlaylistId || !sourcePlatform) return null;
  
  const playlists = platformData.sample_playlists[sourcePlatform] || [];
  return playlists.find(playlist => playlist.id === selectedPlaylistId);
}

async function handleTransfer() {
  if (!sourcePlatform || !targetPlatform || !selectedPlaylistId) return;
  
  const selectedPlaylist = getSelectedPlaylist();
  if (!selectedPlaylist) return;
  
  const transferBtn = document.getElementById('transferBtn');
  const transferProgress = document.getElementById('transferProgress');
  const transferProgressText = document.querySelector('.transfer-progress-text');
  
  // Show loading state
  if (transferBtn) transferBtn.style.display = 'none';
  if (transferProgress) {
    transferProgress.classList.remove('hidden');
    if (transferProgressText) {
      transferProgressText.textContent = `Transferring "${selectedPlaylist.name}"...`;
    }
  }
  
  console.log('Starting transfer of playlist:', selectedPlaylist.name, 'from', sourcePlatform, 'to', targetPlatform);
  
  try {
    // Simulate transfer process
    await simulateTransfer();
    
    // Set the transferred playlist
    transferredPlaylist = { ...selectedPlaylist };
    
    // Update target playlists
    loadTargetPlaylists();
    
    // Clear selection
    selectedPlaylistId = null;
    updatePlaylistVisualStates();
    
    // Show success message
    showSuccessMessage(selectedPlaylist.name);
    
    console.log('Transfer completed successfully:', selectedPlaylist.name);
    
  } catch (error) {
    console.error('Transfer failed:', error);
  } finally {
    // Hide loading state
    if (transferProgress) transferProgress.classList.add('hidden');
    if (transferBtn) transferBtn.style.display = 'flex';
    updateTransferButton();
  }
}

function simulateTransfer() {
  return new Promise(resolve => {
    setTimeout(resolve, 2500);
  });
}

function showSuccessMessage(playlistName) {
  const successMessage = document.getElementById('successMessage');
  const successText = document.querySelector('.success-text');
  if (!successMessage) return;
  
  if (successText) {
    successText.textContent = `"${playlistName}" transferred successfully!`;
  }
  
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
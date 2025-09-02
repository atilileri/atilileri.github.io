/**
 * Playlist Comparer - Main Application
 * Handles OAuth authentication and playlist fetching for Spotify and YouTube Music
 */

// Configuration
const CONFIG = {
    spotify: {
        clientId: 'daf5531459f34869bb03291edc321503',
        redirectUri: window.location.origin + window.location.pathname,
        scopes: ['playlist-read-private', 'playlist-read-collaborative'],
        authorizeUrl: 'https://accounts.spotify.com/authorize',
        tokenUrl: 'https://accounts.spotify.com/api/token',
        apiBaseUrl: 'https://api.spotify.com/v1'
    },
    youtube: {
        clientId: '257465214490-7218m80lm91vuv2l5kdp3cvtd7tktnpt.apps.googleusercontent.com',
        redirectUri: window.location.origin + window.location.pathname,
        scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
        authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        apiBaseUrl: 'https://www.googleapis.com/youtube/v3'
    }
};

/**
 * Utility functions for OAuth PKCE implementation
 */
const AuthUtils = {
    /**
     * Generate a cryptographically random string
     */
    generateRandomString(length) {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], '');
    },

    /**
     * Generate PKCE code verifier
     */
    generateCodeVerifier() {
        return this.generateRandomString(128);
    },

    /**
     * Generate PKCE code challenge from verifier
     */
    async generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    },

    /**
     * Generate secure state parameter
     */
    generateState() {
        return this.generateRandomString(16);
    }
};

/**
 * Spotify API Client
 */
class SpotifyAPI {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
    }

    /**
     * Check if access token is valid
     */
    isAuthenticated() {
        return this.accessToken && this.expiresAt && Date.now() < this.expiresAt;
    }

    /**
     * Initiate OAuth flow
     */
    async login() {
        try {
            const codeVerifier = AuthUtils.generateCodeVerifier();
            const codeChallenge = await AuthUtils.generateCodeChallenge(codeVerifier);
            const state = AuthUtils.generateState();

            // Store PKCE parameters in session storage
            sessionStorage.setItem('spotify_code_verifier', codeVerifier);
            sessionStorage.setItem('spotify_state', state);

            const params = new URLSearchParams({
                client_id: CONFIG.spotify.clientId,
                response_type: 'code',
                redirect_uri: CONFIG.spotify.redirectUri,
                scope: CONFIG.spotify.scopes.join(' '),
                code_challenge_method: 'S256',
                code_challenge: codeChallenge,
                state: state
            });

            window.location.href = `${CONFIG.spotify.authorizeUrl}?${params}`;
        } catch (error) {
            console.error('Spotify login error:', error);
            throw new Error('Failed to initiate Spotify login');
        }
    }

    /**
     * Handle OAuth callback and exchange code for token
     */
    async handleCallback(code, state) {
        try {
            // Verify state parameter
            const storedState = sessionStorage.getItem('spotify_state');
            if (state !== storedState) {
                throw new Error('Invalid state parameter');
            }

            const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
            if (!codeVerifier) {
                throw new Error('Code verifier not found');
            }

            const response = await fetch(CONFIG.spotify.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: CONFIG.spotify.clientId,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: CONFIG.spotify.redirectUri,
                    code_verifier: codeVerifier,
                }),
            });

            if (!response.ok) {
                throw new Error('Token exchange failed');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.expiresAt = Date.now() + (data.expires_in * 1000);

            // Clean up session storage
            sessionStorage.removeItem('spotify_code_verifier');
            sessionStorage.removeItem('spotify_state');

            return true;
        } catch (error) {
            console.error('Spotify callback error:', error);
            throw error;
        }
    }

    /**
     * Make authenticated API request
     */
    async apiRequest(endpoint, options = {}) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${CONFIG.spotify.apiBaseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                this.logout();
                throw new Error('Authentication expired');
            }
            throw new Error(`API request failed: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Fetch user's playlists
     */
    async getPlaylists() {
        try {
            const data = await this.apiRequest('/me/playlists?limit=50');
            return data.items.map(playlist => ({
                id: playlist.id,
                name: playlist.name,
                description: playlist.description,
                trackCount: playlist.tracks.total,
                image: playlist.images?.[0]?.url,
                owner: playlist.owner.display_name,
                public: playlist.public
            }));
        } catch (error) {
            console.error('Failed to fetch Spotify playlists:', error);
            throw error;
        }
    }

    /**
     * Logout and clear tokens
     */
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
        sessionStorage.removeItem('spotify_code_verifier');
        sessionStorage.removeItem('spotify_state');
    }
}

/**
 * YouTube Music API Client
 */
class YouTubeMusicAPI {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
    }

    /**
     * Check if access token is valid
     */
    isAuthenticated() {
        return this.accessToken && this.expiresAt && Date.now() < this.expiresAt;
    }

    /**
     * Initiate OAuth flow
     */
    async login() {
        try {
            // console.log('Initiating YouTube login');
            const codeVerifier = AuthUtils.generateCodeVerifier();
            const codeChallenge = await AuthUtils.generateCodeChallenge(codeVerifier);
            const state = AuthUtils.generateState();

            // Store PKCE parameters in session storage
            sessionStorage.setItem('youtube_code_verifier', codeVerifier);
            sessionStorage.setItem('youtube_state', state);

            const params = new URLSearchParams({
                client_id: CONFIG.youtube.clientId,
                response_type: 'code',
                redirect_uri: CONFIG.youtube.redirectUri,
                scope: CONFIG.youtube.scopes.join(' '),
                // code_challenge_method: 'S256',
                // code_challenge: codeChallenge,
                state: state,
                access_type: 'offline'
            });
            
            console.log(params.toString());

            window.location.href = `${CONFIG.youtube.authorizeUrl}?${params}`;
        } catch (error) {
            console.error('YouTube login error:', error);
            throw new Error('Failed to initiate YouTube login');
        }
    }

    /**
     * Handle OAuth callback and exchange code for token
     */
    async handleCallback(code, state) {
        try {
            console.log(code);
            // Verify state parameter
            const storedState = sessionStorage.getItem('youtube_state');
            if (state !== storedState) {
                throw new Error('Invalid state parameter');
            }
            console.log('YouTube state verified:', state);
            
            const codeVerifier = sessionStorage.getItem('youtube_code_verifier');
            if (!codeVerifier) {
                throw new Error('Code verifier not found');
            }
            console.log('YouTube code verifier found:', codeVerifier);
            const response = await fetch(CONFIG.youtube.tokenUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: CONFIG.youtube.clientId,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: CONFIG.youtube.redirectUri,
                    code_verifier: codeVerifier,
                }),
            });

            // console.log(response);

            if (!response.ok) {
                throw new Error('Token exchange failed');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.expiresAt = Date.now() + (data.expires_in * 1000);

            // Clean up session storage
            sessionStorage.removeItem('youtube_code_verifier');
            sessionStorage.removeItem('youtube_state');

            return true;
        } catch (error) {
            console.error('YouTube callback error:', error);
            throw error;
        }
    }

    /**
     * Make authenticated API request
     */
    async apiRequest(endpoint, options = {}) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${CONFIG.youtube.apiBaseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                this.logout();
                throw new Error('Authentication expired');
            }
            throw new Error(`API request failed: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Fetch user's playlists
     */
    async getPlaylists() {
        try {
            const data = await this.apiRequest('/playlists?part=snippet,contentDetails&mine=true&maxResults=50');
            return data.items.map(playlist => ({
                id: playlist.id,
                name: playlist.snippet.title,
                description: playlist.snippet.description,
                trackCount: playlist.contentDetails.itemCount,
                image: playlist.snippet.thumbnails?.medium?.url,
                owner: playlist.snippet.channelTitle,
                public: playlist.snippet.privacyStatus === 'public'
            }));
        } catch (error) {
            console.error('Failed to fetch YouTube playlists:', error);
            throw error;
        }
    }

    /**
     * Logout and clear tokens
     */
    logout() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
        sessionStorage.removeItem('youtube_code_verifier');
        sessionStorage.removeItem('youtube_state');
    }
}

/**
 * Main Application Class
 */
class PlaylistComparer {
    constructor() {
        this.spotifyAPI = new SpotifyAPI();
        this.youtubeAPI = new YouTubeMusicAPI();
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.handleOAuthCallback();
        this.updateUI();

        // console.log(CONFIG);

        // Check if credentials are configured
        if (CONFIG.spotify.clientId === 'YOUR_SPOTIFY_CLIENT_ID' || 
            CONFIG.youtube.clientId === 'YOUR_GOOGLE_CLIENT_ID') {
            this.showSetupModal();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Spotify login/logout
        document.getElementById('spotify-login').addEventListener('click', () => {
            this.loginSpotify();
        });
        
        document.getElementById('spotify-logout').addEventListener('click', () => {
            this.logoutSpotify();
        });

        // YouTube login/logout
        document.getElementById('youtube-login').addEventListener('click', () => {
            this.loginYouTube();
        });
        
        document.getElementById('youtube-logout').addEventListener('click', () => {
            this.logoutYouTube();
        });

        // Modal close events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideSetupModal();
            });
        });

        // Close modal when clicking outside
        document.getElementById('setup-modal').addEventListener('click', (e) => {
            if (e.target.id === 'setup-modal') {
                this.hideSetupModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSetupModal();
            }
        });

        // Retry buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('retry-btn')) {
                const column = e.target.closest('.playlist-column');
                if (column.querySelector('#spotify-error')) {
                    this.loadSpotifyPlaylists();
                } else if (column.querySelector('#youtube-error')) {
                    this.loadYouTubePlaylists();
                }
            }
        });
    }

    /**
     * Handle OAuth callback
     */
    handleOAuthCallback() {
        console.log('Handling OAuth callback if present');
        const urlParams = new URLSearchParams(window.location.search);
        console.log(urlParams.toString());
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
            this.showError('spotify', `Authentication failed: ${error}`);
            return;
        }

        if (code && state) {
            // Determine which service this callback is for based on stored state
            const spotifyState = sessionStorage.getItem('spotify_state');
            const youtubeState = sessionStorage.getItem('youtube_state');

            if (state === spotifyState) {
                this.handleSpotifyCallback(code, state);
            } else if (state === youtubeState) {
                this.handleYouTubeCallback(code, state);
            }

            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    /**
     * Handle Spotify OAuth callback
     */
    async handleSpotifyCallback(code, state) {
        try {
            await this.spotifyAPI.handleCallback(code, state);
            this.updateUI();
            this.loadSpotifyPlaylists();
        } catch (error) {
            this.showError('spotify', 'Failed to authenticate with Spotify');
        }
    }

    /**
     * Handle YouTube OAuth callback
     */
    async handleYouTubeCallback(code, state) {
        try {
            console.log('Handling YouTube callback');
            await this.youtubeAPI.handleCallback(code, state);
            this.updateUI();
            this.loadYouTubePlaylists();
        } catch (error) {
            this.showError('youtube', 'Failed to authenticate with YouTube Music');
        }
    }

    /**
     * Login to Spotify
     */
    async loginSpotify() {
        try {
            this.setButtonLoading('spotify-login', true);
            await this.spotifyAPI.login();
        } catch (error) {
            this.setButtonLoading('spotify-login', false);
            this.showError('spotify', 'Failed to initiate Spotify login');
        }
    }

    /**
     * Login to YouTube Music
     */
    async loginYouTube() {
        try {
            // console.log('YouTube login button clicked');
            this.setButtonLoading('youtube-login', true);
            await this.youtubeAPI.login();
        } catch (error) {
            this.setButtonLoading('youtube-login', false);
            this.showError('youtube', 'Failed to initiate YouTube Music login');
        }
    }

    /**
     * Logout from Spotify
     */
    logoutSpotify() {
        this.spotifyAPI.logout();
        this.updateUI();
        this.clearPlaylists('spotify');
    }

    /**
     * Logout from YouTube Music
     */
    logoutYouTube() {
        this.youtubeAPI.logout();
        this.updateUI();
        this.clearPlaylists('youtube');
    }

    /**
     * Load Spotify playlists
     */
    async loadSpotifyPlaylists() {
        try {
            this.showLoading('spotify');
            const playlists = await this.spotifyAPI.getPlaylists();
            this.displayPlaylists('spotify', playlists);
        } catch (error) {
            this.showError('spotify', 'Failed to load Spotify playlists');
        }
    }

    /**
     * Load YouTube Music playlists
     */
    async loadYouTubePlaylists() {
        try {
            this.showLoading('youtube');
            const playlists = await this.youtubeAPI.getPlaylists();
            this.displayPlaylists('youtube', playlists);
        } catch (error) {
            this.showError('youtube', 'Failed to load YouTube Music playlists');
        }
    }

    /**
     * Display playlists in the UI
     */
    displayPlaylists(service, playlists) {
        const container = document.getElementById(`${service}-playlists`);
        
        this.hideLoading(service);
        this.hideError(service);
        this.hideEmpty(service);

        if (playlists.length === 0) {
            this.showEmpty(service);
            return;
        }

        container.innerHTML = playlists.map(playlist => `
            <div class="playlist-item" tabindex="0">
                <div class="playlist-header">
                    <div class="playlist-thumbnail">
                        ${playlist.image ? 
                            `<img src="${playlist.image}" alt="${playlist.name}">` : 
                            '🎵'
                        }
                    </div>
                    <div class="playlist-info">
                        <h3 class="playlist-name">${this.escapeHtml(playlist.name)}</h3>
                        ${playlist.description ? 
                            `<p class="playlist-description">${this.escapeHtml(playlist.description)}</p>` : 
                            ''
                        }
                        <div class="playlist-meta">
                            <div class="playlist-stat">
                                <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                                <span>${playlist.trackCount} tracks</span>
                            </div>
                            <div class="playlist-stat">
                                <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                <span>${playlist.public ? 'Public' : 'Private'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update UI based on authentication state
     */
    updateUI() {
        // Spotify UI
        const spotifyAuthenticated = this.spotifyAPI.isAuthenticated();
        document.getElementById('spotify-login').classList.toggle('hidden', spotifyAuthenticated);
        document.getElementById('spotify-logout').classList.toggle('hidden', !spotifyAuthenticated);

        // YouTube UI
        const youtubeAuthenticated = this.youtubeAPI.isAuthenticated();
        document.getElementById('youtube-login').classList.toggle('hidden', youtubeAuthenticated);
        document.getElementById('youtube-logout').classList.toggle('hidden', !youtubeAuthenticated);

        // Load playlists if authenticated
        if (spotifyAuthenticated && !document.getElementById('spotify-playlists').innerHTML) {
            this.loadSpotifyPlaylists();
        }
        if (youtubeAuthenticated && !document.getElementById('youtube-playlists').innerHTML) {
            this.loadYouTubePlaylists();
        }
    }

    /**
     * Utility methods for UI state management
     */
    setButtonLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        button.classList.toggle('loading', loading);
        button.disabled = loading;
    }

    showLoading(service) {
        document.getElementById(`${service}-loading`).classList.remove('hidden');
        document.getElementById(`${service}-error`).classList.add('hidden');
        document.getElementById(`${service}-empty`).classList.add('hidden');
    }

    hideLoading(service) {
        document.getElementById(`${service}-loading`).classList.add('hidden');
    }

    showError(service, message) {
        const errorElement = document.getElementById(`${service}-error`);
        errorElement.querySelector('.error-message').textContent = message;
        errorElement.classList.remove('hidden');
        document.getElementById(`${service}-loading`).classList.add('hidden');
        document.getElementById(`${service}-empty`).classList.add('hidden');
    }

    hideError(service) {
        document.getElementById(`${service}-error`).classList.add('hidden');
    }

    showEmpty(service) {
        document.getElementById(`${service}-empty`).classList.remove('hidden');
    }

    hideEmpty(service) {
        document.getElementById(`${service}-empty`).classList.add('hidden');
    }

    clearPlaylists(service) {
        document.getElementById(`${service}-playlists`).innerHTML = '';
        this.showEmpty(service);
    }

    showSetupModal() {
        document.getElementById('setup-modal').classList.remove('hidden');
    }

    hideSetupModal() {
        document.getElementById('setup-modal').classList.add('hidden');
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PlaylistComparer();
});
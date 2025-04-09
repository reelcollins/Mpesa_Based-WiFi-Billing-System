const RouterOSAPI = require('node-routeros').RouterOSAPI;
require('dotenv').config();

class MikroTikService {
    constructor() {
        this.connection = new RouterOSAPI({
            host: process.env.MIKROTIK_HOST,
            username: process.env.MIKROTIK_USERNAME,
            password: process.env.MIKROTIK_PASSWORD,
            port: process.env.MIKROTIK_PORT || 8728
        });
    }

    async connect() {
        try {
            await this.connection.connect();
            console.log('Connected to MikroTik router');
            return true;
        } catch (error) {
            console.error('Failed to connect to MikroTik router:', error);
            return false;
        }
    }

    async disconnect() {
        try {
            await this.connection.close();
            console.log('Disconnected from MikroTik router');
            return true;
        } catch (error) {
            console.error('Error disconnecting from MikroTik router:', error);
            return false;
        }
    }

    async addHotspotUser(username, password, profile = 'default', timeLimit = '1h') {
        try {
            const response = await this.connection.write('/ip/hotspot/user/add', {
                name: username,
                password: password,
                profile: profile,
                limit_uptime: timeLimit
            });
            return response;
        } catch (error) {
            console.error('Error adding hotspot user:', error);
            throw error;
        }
    }

    async removeHotspotUser(username) {
        try {
            const users = await this.connection.write('/ip/hotspot/user/print', {
                '?name': username
            });
            
            if (users && users.length > 0) {
                await this.connection.write('/ip/hotspot/user/remove', {
                    '.id': users[0]['.id']
                });
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing hotspot user:', error);
            throw error;
        }
    }

    async getActiveUsers() {
        try {
            const activeUsers = await this.connection.write('/ip/hotspot/active/print');
            return activeUsers;
        } catch (error) {
            console.error('Error getting active users:', error);
            throw error;
        }
    }
}

module.exports = new MikroTikService(); 
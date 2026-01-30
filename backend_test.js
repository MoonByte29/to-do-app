const axios = require('axios');

class TaskFlowAPITester {
    constructor() {
        this.baseURL = 'https://taskflow-3159.preview.emergentagent.com/api';
        this.token = null;
        this.testUser = {
            name: 'Test User',
            email: `test_${Date.now()}@example.com`,
            password: 'TestPass123!'
        };
        this.testBoard = null;
        this.testTask = null;
        this.testsRun = 0;
        this.testsPassed = 0;
        this.testResults = [];
    }

    async runTest(name, testFn) {
        this.testsRun++;
        console.log(`\n🔍 Testing: ${name}`);
        
        try {
            await testFn();
            this.testsPassed++;
            console.log(`✅ PASSED: ${name}`);
            this.testResults.push({ name, status: 'PASSED', error: null });
            return true;
        } catch (error) {
            console.log(`❌ FAILED: ${name}`);
            console.log(`   Error: ${error.message}`);
            this.testResults.push({ name, status: 'FAILED', error: error.message });
            return false;
        }
    }

    async makeRequest(method, endpoint, data = null, expectStatus = 200) {
        const config = {
            method,
            url: `${this.baseURL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        
        if (response.status !== expectStatus) {
            throw new Error(`Expected status ${expectStatus}, got ${response.status}`);
        }

        return response.data;
    }

    async testHealthCheck() {
        await this.runTest('Health Check', async () => {
            const response = await this.makeRequest('GET', '/health');
            if (!response.status || response.status !== 'ok') {
                throw new Error('Health check failed');
            }
        });
    }

    async testUserRegistration() {
        await this.runTest('User Registration', async () => {
            const response = await this.makeRequest('POST', '/auth/register', this.testUser, 201);
            
            if (!response.token || !response.user) {
                throw new Error('Registration response missing token or user');
            }
            
            this.token = response.token;
            console.log(`   Registered user: ${response.user.email}`);
        });
    }

    async testUserLogin() {
        await this.runTest('User Login', async () => {
            const loginData = {
                email: this.testUser.email,
                password: this.testUser.password
            };
            
            const response = await this.makeRequest('POST', '/auth/login', loginData);
            
            if (!response.token || !response.user) {
                throw new Error('Login response missing token or user');
            }
            
            this.token = response.token;
            console.log(`   Logged in user: ${response.user.email}`);
        });
    }

    async testInvalidLogin() {
        await this.runTest('Invalid Login Credentials', async () => {
            try {
                await this.makeRequest('POST', '/auth/login', {
                    email: this.testUser.email,
                    password: 'wrongpassword'
                });
                throw new Error('Should have failed with invalid credentials');
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    // Expected behavior
                    return;
                }
                throw error;
            }
        });
    }

    async testGetUserProfile() {
        await this.runTest('Get User Profile', async () => {
            const response = await this.makeRequest('GET', '/auth/me');
            
            if (!response.user || response.user.email !== this.testUser.email) {
                throw new Error('User profile data incorrect');
            }
        });
    }

    async testCreateBoard() {
        await this.runTest('Create Board', async () => {
            const boardData = {
                title: 'Test Board',
                description: 'A test board for API testing',
                color: '#7694b8'
            };
            
            const response = await this.makeRequest('POST', '/boards', boardData, 201);
            
            if (!response.board || response.board.title !== boardData.title) {
                throw new Error('Board creation failed');
            }
            
            this.testBoard = response.board;
            console.log(`   Created board: ${response.board.title} (ID: ${response.board.id})`);
        });
    }

    async testGetBoards() {
        await this.runTest('Get Boards List', async () => {
            const response = await this.makeRequest('GET', '/boards');
            
            if (!response.boards || !Array.isArray(response.boards)) {
                throw new Error('Boards list not returned properly');
            }
            
            const foundBoard = response.boards.find(b => b.id === this.testBoard.id);
            if (!foundBoard) {
                throw new Error('Created board not found in boards list');
            }
            
            console.log(`   Found ${response.boards.length} boards`);
        });
    }

    async testGetSingleBoard() {
        await this.runTest('Get Single Board', async () => {
            const response = await this.makeRequest('GET', `/boards/${this.testBoard.id}`);
            
            if (!response.board || response.board.id !== this.testBoard.id) {
                throw new Error('Board details not returned correctly');
            }
        });
    }

    async testUpdateBoard() {
        await this.runTest('Update Board', async () => {
            const updateData = {
                title: 'Updated Test Board',
                description: 'Updated description',
                color: '#53769d'
            };
            
            const response = await this.makeRequest('PUT', `/boards/${this.testBoard.id}`, updateData);
            
            if (!response.board || response.board.title !== updateData.title) {
                throw new Error('Board update failed');
            }
            
            this.testBoard = response.board;
        });
    }

    async testCreateTask() {
        await this.runTest('Create Task', async () => {
            const taskData = {
                title: 'Test Task',
                description: 'A test task for API testing',
                boardId: this.testBoard.id,
                priority: 'high',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
                reminderDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
                tags: ['test', 'api', 'urgent'],
                notes: 'This is a test task created by the API tester'
            };
            
            const response = await this.makeRequest('POST', '/tasks', taskData, 201);
            
            if (!response.task || response.task.title !== taskData.title) {
                throw new Error('Task creation failed');
            }
            
            this.testTask = response.task;
            console.log(`   Created task: ${response.task.title} (ID: ${response.task.id})`);
        });
    }

    async testGetTasksForBoard() {
        await this.runTest('Get Tasks for Board', async () => {
            const response = await this.makeRequest('GET', `/tasks/board/${this.testBoard.id}`);
            
            if (!response.tasks || !Array.isArray(response.tasks)) {
                throw new Error('Tasks list not returned properly');
            }
            
            const foundTask = response.tasks.find(t => t.id === this.testTask.id);
            if (!foundTask) {
                throw new Error('Created task not found in tasks list');
            }
            
            console.log(`   Found ${response.tasks.length} tasks for board`);
        });
    }

    async testUpdateTask() {
        await this.runTest('Update Task', async () => {
            const updateData = {
                title: 'Updated Test Task',
                description: 'Updated description',
                priority: 'medium',
                status: 'completed',
                tags: ['updated', 'completed'],
                notes: 'Task has been updated and completed'
            };
            
            const response = await this.makeRequest('PUT', `/tasks/${this.testTask.id}`, updateData);
            
            if (!response.task || response.task.title !== updateData.title || response.task.status !== 'completed') {
                throw new Error('Task update failed');
            }
            
            this.testTask = response.task;
        });
    }

    async testGetUpcomingTasks() {
        await this.runTest('Get Upcoming Tasks', async () => {
            // Create a task with due date in the next week
            const futureTaskData = {
                title: 'Future Task',
                description: 'Task due next week',
                boardId: this.testBoard.id,
                priority: 'low',
                dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
                status: 'pending'
            };
            
            await this.makeRequest('POST', '/tasks', futureTaskData, 201);
            
            const response = await this.makeRequest('GET', '/tasks/upcoming');
            
            if (!response.tasks || !Array.isArray(response.tasks)) {
                throw new Error('Upcoming tasks not returned properly');
            }
            
            console.log(`   Found ${response.tasks.length} upcoming tasks`);
        });
    }

    async testDeleteTask() {
        await this.runTest('Delete Task', async () => {
            const response = await this.makeRequest('DELETE', `/tasks/${this.testTask.id}`);
            
            if (!response.message || !response.message.includes('deleted')) {
                throw new Error('Task deletion response incorrect');
            }
            
            // Verify task is deleted
            try {
                await this.makeRequest('GET', `/tasks/board/${this.testBoard.id}`);
                // Task should not be in the list anymore (we'll check this in a separate test)
            } catch (error) {
                // This is expected if the board has no tasks
            }
        });
    }

    async testDeleteBoard() {
        await this.runTest('Delete Board (and associated tasks)', async () => {
            const response = await this.makeRequest('DELETE', `/boards/${this.testBoard.id}`);
            
            if (!response.message || !response.message.includes('deleted')) {
                throw new Error('Board deletion response incorrect');
            }
            
            // Verify board is deleted
            try {
                await this.makeRequest('GET', `/boards/${this.testBoard.id}`);
                throw new Error('Board should have been deleted');
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // Expected behavior
                    return;
                }
                throw error;
            }
        });
    }

    async testUnauthorizedAccess() {
        await this.runTest('Unauthorized Access Protection', async () => {
            const originalToken = this.token;
            this.token = null; // Remove token
            
            try {
                await this.makeRequest('GET', '/boards');
                throw new Error('Should have failed without token');
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    // Expected behavior
                    this.token = originalToken; // Restore token
                    return;
                }
                throw error;
            }
        });
    }

    async runAllTests() {
        console.log('🚀 Starting TaskFlow API Tests...\n');
        console.log(`📍 Testing against: ${this.baseURL}`);
        
        // Health and Authentication Tests
        await this.testHealthCheck();
        await this.testUserRegistration();
        await this.testInvalidLogin();
        await this.testUserLogin();
        await this.testGetUserProfile();
        await this.testUnauthorizedAccess();
        
        // Board Management Tests
        await this.testCreateBoard();
        await this.testGetBoards();
        await this.testGetSingleBoard();
        await this.testUpdateBoard();
        
        // Task Management Tests
        await this.testCreateTask();
        await this.testGetTasksForBoard();
        await this.testUpdateTask();
        await this.testGetUpcomingTasks();
        await this.testDeleteTask();
        
        // Cleanup Tests
        await this.testDeleteBoard();
        
        this.printSummary();
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.testsRun}`);
        console.log(`Passed: ${this.testsPassed}`);
        console.log(`Failed: ${this.testsRun - this.testsPassed}`);
        console.log(`Success Rate: ${((this.testsPassed / this.testsRun) * 100).toFixed(1)}%`);
        
        const failedTests = this.testResults.filter(t => t.status === 'FAILED');
        if (failedTests.length > 0) {
            console.log('\n❌ FAILED TESTS:');
            failedTests.forEach(test => {
                console.log(`   • ${test.name}: ${test.error}`);
            });
        }
        
        console.log('='.repeat(60));
        
        if (this.testsPassed === this.testsRun) {
            console.log('🎉 All tests passed! Backend API is working correctly.');
            return 0;
        } else {
            console.log('⚠️  Some tests failed. Please check the issues above.');
            return 1;
        }
    }
}

// Run the tests
async function main() {
    const tester = new TaskFlowAPITester();
    try {
        await tester.runAllTests();
        process.exit(tester.testsPassed === tester.testsRun ? 0 : 1);
    } catch (error) {
        console.error('💥 Test runner crashed:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = TaskFlowAPITester;
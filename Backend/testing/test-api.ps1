# API Testing Script
$baseUrl = "http://localhost:5000"
$testEmail = "testuser_$(Get-Random)@example.com"
$testPassword = "password123"

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "API TESTING SUITE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Helper function to make API calls
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [hashtable]$Headers = @{}
    )
    
    Write-Host "`n--- $Name ---" -ForegroundColor Cyan
    Write-Host "$Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response: $($response.Content)" -ForegroundColor White
        return $response
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status: $statusCode" -ForegroundColor Yellow
        
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor White
        }
        return $null
    }
}

# 1. Health Check
Test-Endpoint -Name "Health Check" -Url "$baseUrl/"

# 2. Auth - Signup with missing fields
Test-Endpoint -Name "Signup (Missing Fields)" -Url "$baseUrl/api/auth/signup" -Method POST -Body @{email=$testEmail}

# 3. Auth - Signup with short password
Test-Endpoint -Name "Signup (Short Password)" -Url "$baseUrl/api/auth/signup" -Method POST -Body @{
    fullName="Test User"
    email=$testEmail
    password="123"
}

# 4. Auth - Signup with invalid email
Test-Endpoint -Name "Signup (Invalid Email)" -Url "$baseUrl/api/auth/signup" -Method POST -Body @{
    fullName="Test User"
    email="invalid-email"
    password=$testPassword
}

# 5. Auth - Valid Signup
$signupResponse = Test-Endpoint -Name "Signup (Valid)" -Url "$baseUrl/api/auth/signup" -Method POST -Body @{
    fullName="Test User"
    email=$testEmail
    password=$testPassword
}

# Extract token from cookie if signup succeeded
$token = $null
if ($signupResponse) {
    $cookies = $signupResponse.Headers['Set-Cookie']
    if ($cookies -match 'jwt=([^;]+)') {
        $token = $matches[1]
        Write-Host "JWT Token extracted: $($token.Substring(0, 20))..." -ForegroundColor Green
    }
}

# 6. Auth - Login with missing fields
Test-Endpoint -Name "Login (Missing Fields)" -Url "$baseUrl/api/auth/login" -Method POST -Body @{email=$testEmail}

# 7. Auth - Login with wrong credentials
Test-Endpoint -Name "Login (Wrong Password)" -Url "$baseUrl/api/auth/login" -Method POST -Body @{
    email=$testEmail
    password="wrongpassword"
}

# 8. Auth - Valid Login
$loginResponse = Test-Endpoint -Name "Login (Valid)" -Url "$baseUrl/api/auth/login" -Method POST -Body @{
    email=$testEmail
    password=$testPassword
}

# Extract token from login cookie
if ($loginResponse) {
    $cookies = $loginResponse.Headers['Set-Cookie']
    if ($cookies -match 'jwt=([^;]+)') {
        $token = $matches[1]
        Write-Host "JWT Token extracted from login: $($token.Substring(0, 20))..." -ForegroundColor Green
    }
}

# 9. Agents - Get agents without auth
Test-Endpoint -Name "Get Agents (No Auth)" -Url "$baseUrl/api/agents"

# 10. Agents - Get agents with auth
if ($token) {
    $authHeaders = @{ 
        "Authorization" = "Bearer $token"
    }
    Test-Endpoint -Name "Get Agents (With Auth)" -Url "$baseUrl/api/agents" -Headers $authHeaders
    
    # 11. Agents - Create agent (missing fields)
    Test-Endpoint -Name "Create Agent (Missing Fields)" -Url "$baseUrl/api/agents" -Method POST -Headers $authHeaders -Body @{
        name="Test Agent"
    }
    
    # 12. Agents - Create agent (valid)
    $agentResponse = Test-Endpoint -Name "Create Agent (Valid)" -Url "$baseUrl/api/agents" -Method POST -Headers $authHeaders -Body @{
        name="Test Agent"
        prompt="You are a friendly and helpful AI assistant."
    }
    
    $agentId = $null
    if ($agentResponse) {
        $agentData = $agentResponse.Content | ConvertFrom-Json
        $agentId = $agentData._id
        Write-Host "Agent ID: $agentId" -ForegroundColor Green
    }
    
    # 13. Chat - Send message without agentId
    Test-Endpoint -Name "Send Message (No Agent)" -Url "$baseUrl/api/chat" -Method POST -Headers $authHeaders -Body @{
        message="Hello, how are you?"
    }
    
    # 14. Chat - Send message with valid agent
    if ($agentId) {
        Test-Endpoint -Name "Send Message (With Agent)" -Url "$baseUrl/api/chat/message" -Method POST -Headers $authHeaders -Body @{
            message="Hello, I need help with something."
            agentId=$agentId
        }
        
        # 15. Chat - Second message in conversation
        Test-Endpoint -Name "Send Follow-up Message" -Url "$baseUrl/api/chat" -Method POST -Headers $authHeaders -Body @{
            message="Can you tell me more?"
            agentId=$agentId
        }
    }
    
    # 16. Update Profile - No profile pic
    Test-Endpoint -Name "Update Profile (No Data)" -Url "$baseUrl/api/auth/update-profile" -Method PUT -Headers $authHeaders -Body @{}
    
    # 17. Admin - Get Users (should fail if not admin)
    Test-Endpoint -Name "Admin - Get Users" -Url "$baseUrl/api/admin/users" -Headers $authHeaders
    
    # 18. Admin - Get Agents
    Test-Endpoint -Name "Admin - Get Agents" -Url "$baseUrl/api/admin/agents" -Headers $authHeaders
    
    # 19. Logout
    Test-Endpoint -Name "Logout" -Url "$baseUrl/api/auth/logout" -Method POST -Headers $authHeaders
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "TESTING COMPLETE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

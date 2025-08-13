import axios from 'axios';

export const githubLogin = (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.FRONTEND_URL}/auth/callback&scope=read:user,repo`;
  res.json({ url: githubAuthUrl });
};

export const githubCallback = async (req, res) => {
  const { code } = req.query;
  console.log('🔥 GitHub callback received with code:', code ? 'YES' : 'NO');

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${process.env.FRONTEND_URL}/auth/callback`
    }, {
      headers: { Accept: 'application/json' }
    });

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error('[githubCallback] Token exchange response:', tokenResponse.data)
      throw new Error('No access token received from GitHub');
    }

    // Set token in cookie
    res.cookie('github_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Get user data
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    // Return success response with user data
    res.json({
      success: true,
      user: userResponse.data,
      message: 'Authentication successful'
    });
  } catch (error) {
    const status = error.response?.status || 500
    const ghMessage = error.response?.data?.error_description || error.response?.data?.error || error.message
    console.error('[githubCallback] OAuth Error:', status, ghMessage)
    res.status(status).json({
      success: false,
      error: 'Authentication failed',
      details: ghMessage
    });
  }
};
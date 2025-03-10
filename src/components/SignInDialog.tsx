import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  TextField, 
  Button,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  backdropClasses
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { db } from '../db/LocalDB';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../constants/themeColors';
import { v4 as uuidv4 } from 'uuid';

// App Logo component (based on AltRouteRotated from RCAAppShell)
const AppLogo = ({ color }: { color: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      height="40px" 
      viewBox="0 -960 960 960" 
      width="40px" 
      fill="currentColor"
      style={{ 
        color: color,
        flexShrink: 0 
      }}
    >
      <g transform="rotate(180 480 -480)">
        <path d="M440-80v-200q0-56-17-83t-45-53l57-57q12 11 23 23.5t22 26.5q14-19 28.5-33.5T538-485q38-35 69-81t33-161l-63 63-57-56 160-160 160 160-56 56-64-63q-2 143-44 203.5T592-425q-32 29-52 56.5T520-280v200h-80ZM248-633q-4-20-5.5-44t-2.5-50l-64 63-56-56 160-160 160 160-57 56-63-62q0 21 2 39.5t4 34.5l-78 19Zm86 176q-20-21-38.5-49T263-575l77-19q10 27 23 46t28 34l-57 57Z"/>
      </g>
    </svg>
  );
};

export function SignInDialog() {
  const { currentUser, setCurrentUser, loading } = useUser();
  const { isDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get theme-specific colors
  const COLORS = getThemeColors(isDarkMode);

  // Show dialog when no user is logged in and loading is complete
  useEffect(() => {
    if (!loading && !currentUser) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [currentUser, loading]);

  const handleSignIn = async () => {
    if (!username.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Check if user exists
      let user = await db.users.where('username').equals(username).first();
      
      if (!user) {
        // Create new user
        user = {
          id: uuidv4(),
          username: username.trim(),
          passwordHash: password || undefined
        };
        await db.users.add(user);
      } else {
        // If user exists and has a password, check it
        if (user.passwordHash && user.passwordHash !== password) {
          alert('Incorrect password');
          setIsSubmitting(false);
          return;
        }
        
        // If user had no password but now provides one, update it
        if (!user.passwordHash && password) {
          user.passwordHash = password;
          await db.users.update(user.id, { passwordHash: password });
        }
      }
      
      setCurrentUser(user);
      setOpen(false);
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Create a function to handle key press events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && username.trim()) {
      handleSignIn();
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="xs" 
      fullWidth 
      onClose={() => {}} // Prevent closing by clicking outside
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: isDarkMode 
            ? '0 8px 24px rgba(0, 0, 0, 0.5)' 
            : '0 8px 24px rgba(0, 0, 0, 0.12)',
          backgroundColor: COLORS.dialogBg,
          border: `1px solid ${COLORS.border}`,
          '& .MuiDialogContent-root': {
            backgroundColor: COLORS.dialogBg
          }
        }
      }}
      sx={{
        [`& .${backdropClasses.root}`]: {
          backgroundColor: COLORS.backdropColor
        }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          pt: 4,
          pb: 1,
          px: 3,
          backgroundColor: COLORS.dialogBg
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3 
          }}
        >
          <AppLogo color={COLORS.text} />
          <Typography 
            variant="h6" 
            component="div" 
            noWrap
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 'bold',
              fontSize: '1.8rem',
              ml: 1.5,
              flexShrink: 0,
            }}
          >
            <Box component="span" sx={{ color: COLORS.text }}>Why</Box>
            <Box component="span" sx={{ color: COLORS.lightText }}>Because</Box>
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{ 
            color: COLORS.lightText, 
            textAlign: 'center',
            mb: 3,
            maxWidth: '90%',
            lineHeight: 1.5
          }}
        >
          Enter a username and optional password to get started. Your projects will be saved locally.
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 0, px: 3 }}>
        <TextField
          placeholder="Username"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          inputProps={{ maxLength: 30 }}
          variant="outlined"
          onKeyDown={handleKeyDown}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              '&.Mui-focused fieldset': {
                borderColor: COLORS.text
              },
              backgroundColor: COLORS.inputBg
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: COLORS.text
            },
            '& .MuiInputBase-input': {
              color: COLORS.text
            }
          }}
        />
        <TextField
          placeholder="Password (Optional)"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant="outlined"
          onKeyDown={handleKeyDown}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              '&.Mui-focused fieldset': {
                borderColor: COLORS.text
              },
              backgroundColor: COLORS.inputBg
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: COLORS.text
            },
            '& .MuiInputBase-input': {
              color: COLORS.text
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                  sx={{ color: COLORS.lightText }}
                >
                  {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>

      <Box sx={{ 
        px: 3, 
        pb: 4,
        backgroundColor: COLORS.dialogBg
      }}>
        <Button 
          onClick={handleSignIn} 
          disabled={!username.trim() || isSubmitting}
          fullWidth
          startIcon={<LoginIcon />}
          sx={{ 
            backgroundColor: COLORS.buttonBg,
            '&:hover': {
              backgroundColor: COLORS.buttonHoverBg,
            },
            color: 'white',
            py: 1.25,
            borderRadius: 1.5,
            textTransform: 'uppercase',
            fontWeight: 500,
            fontSize: '0.875rem',
            letterSpacing: '0.05em'
          }}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
      </Box>
    </Dialog>
  );
} 
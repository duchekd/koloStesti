import { useState } from "react";

import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from "@mui/material";

import { mdiLogin, mdiLogout } from "@mdi/js";
import Icon from "@mdi/react";

import useAuth from "../../hooks/useAuth";

import { isFirebaseConfigured } from "../../firebase";
import useTexts from "../../languages";

// Přihlášení Googlem kvůli sdílené synchronizaci. Bez konfigurace Firebase se nezobrazuje.
const AuthButton = () => {
  const texts = useTexts();
  const { user, loading, signInWithGoogle, signOutUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!isFirebaseConfigured || loading) return null;

  if (!user) {
    return (
      <Tooltip title={texts.signIn}>
        <IconButton onClick={() => void signInWithGoogle()} aria-label={texts.signIn}>
          <Icon path={mdiLogin} size={1} />
        </IconButton>
      </Tooltip>
    );
  }

  const handleSignOut = () => {
    setAnchorEl(null);
    void signOutUser();
  };

  return (
    <>
      <Tooltip title={user.displayName ?? user.email ?? texts.signedIn}>
        <IconButton onClick={event => setAnchorEl(event.currentTarget)} aria-label={texts.account} sx={{ p: 0.5 }}>
          <Avatar src={user.photoURL ?? undefined} sx={{ width: 28, height: 28 }}>
            {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }} noWrap>
          {user.email ?? user.displayName}
        </Typography>
        <Divider />
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <Icon path={mdiLogout} size={0.9} />
          </ListItemIcon>
          {texts.signOut}
        </MenuItem>
      </Menu>
    </>
  );
};

export default AuthButton;

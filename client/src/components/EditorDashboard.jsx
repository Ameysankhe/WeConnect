import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Badge,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const EditorDashboard = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // "success", "error", "warning", "info"
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const navigate = useNavigate();



  useEffect(() => {
    // Fetch notifications periodically
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:4000/editor/notifications", {
          method: 'GET',
          credentials: "include", // Include credentials for authenticated requests
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Notifications:", data);
          setNotifications(data);
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications(); // Fetch notifications initially
    const intervalId = setInterval(fetchNotifications, 7200000); // Fetch every 2 hours

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch("http://localhost:4000/editor/workspaces", {
        method: 'GET',
        credentials: "include", // Include credentials for authenticated requests
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Workspaces:", data);
        setWorkspaces(data);
      } else {
        console.error("Failed to fetch workspaces");
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
    }
  };

  useEffect(() => {
    fetchWorkspaces(); // Fetch workspaces initially when the component mounts
  }, []);



  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (latestNotification && !latestNotification.seen) {
        setSnackbar({
          open: true,
          message: `New notification: ${latestNotification.message}`,
          severity: "info",
        });
      }
    }
  }, [notifications]);

  const handleAccept = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:4000/editor/notifications/accept/${notificationId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Invite accepted successfully!',
          severity: 'success',
        });
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.id !== notificationId)
        );
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to accept invite',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error accepting invite:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred',
        severity: 'error',
      });
    }
  };

  const handleDecline = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:4000/editor/notifications/decline/${notificationId}`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'Invite declined',
          severity: 'success',
        });
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification.id !== notificationId)
        );
      } else {
        setSnackbar({
          open: true,
          message: 'Failed to decline invite',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error declining invite:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred',
        severity: 'error',
      });
    }
  };



  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:4000/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setSnackbar({
          open: true,
          message: data.message,
          severity: "success",
        });
        setTimeout(() => {
          window.location.href = "/"; // Redirect to the home page
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: "Logout failed",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error logging out:", error);
      setSnackbar({
        open: true,
        message: "An error occurred during logout",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleNotificationClick = () => {
    setShowNotifications((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="fixed"
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              YouConnect
            </Typography>
            {/* <IconButton color="inherit" onClick={handleNotificationClick}> */}
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge
                badgeContent={notifications.filter((notif) => !notif.seen).length} // Number of unread notifications
                color="error"
              >
                  <NotificationsIcon />
              </Badge>
            </IconButton>
            {showNotifications && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50px",
                  right: "10px",
                  width: "300px",
                  bgcolor: "background.paper",
                  boxShadow: 3,
                  borderRadius: 1,
                  zIndex: 1201,
                  p: 2,
                }}
              >
                <Typography variant="h6" sx={{
                  color: "black", // Ensure text is visible
                  backgroundColor: "white", // Contrast background
                }}>Notifications</Typography>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <Box
                      key={notification.id}
                      sx={{
                        borderBottom: "1px solid #ddd",
                        pb: 1,
                        mb: 1,
                      }}
                    >
                      {/* <Typography variant="body1">{notification.message}</Typography> */}
                      <Typography
                        variant="body1"
                        sx={{
                          color: "black", // Ensure text is visible
                          backgroundColor: "white", // Contrast background
                        }}
                      >
                        {notification.message || "No message available"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(notification.created_at).toLocaleString()}
                      </Typography>
                      {notification.status === 'pending' && (
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAccept(notification.id)}
                          >
                            Accept
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => handleDecline(notification.id)}
                          >
                            Decline
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No new notifications
                  </Typography>
                )}
              </Box>
            )}

            <IconButton color="inherit">
              <AccountCircleIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Toolbar />
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <Typography variant="h4" color="textSecondary">
            No Work Assigned
          </Typography>
        </Box> */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
          {workspaces.length > 0 ? (
            workspaces.map((workspace) => (
              <Box
                key={workspace.id}
                sx={{
                  width: "80%",
                  backgroundColor: "white",
                  padding: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  marginBottom: 2,
                }}
              >
                <Typography variant="h6">{workspace.name}</Typography>
                <Typography variant="body2" color="textSecondary">{workspace.description}</Typography>
                <Button variant="contained" color="primary" sx={{ mt: 2 }}>
                  Enter Workspace
                </Button>
                {/* <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/workspace/${workspace.id}`)} // Dynamic routing
                >
                  Enter Workspace
                </Button> */}
              </Box>
            ))
          ) : (
            <Typography variant="h6" color="textSecondary">No workspaces available</Typography>
          )}
        </Box>

      </Box>
      {/* Snackbar for alerts */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditorDashboard;

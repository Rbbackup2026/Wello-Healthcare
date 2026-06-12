"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

const DEFAULT_SETTINGS = {
  earnType: "percentage",
  earnValue: 5,
  coinValue: 1,
  maxRedeemPercent: 50,
  minOrderToEarn: 0,
  minOrderToRedeem: 0,
  active: true,
};

const WalletSettingsPanel = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/wallet/settings`);
      if (data?.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
      }
    } catch (error) {
      console.error("Failed to fetch wallet settings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        earnValue: Number(settings.earnValue),
        coinValue: Number(settings.coinValue),
        maxRedeemPercent: Number(settings.maxRedeemPercent),
        minOrderToEarn: Number(settings.minOrderToEarn),
        minOrderToRedeem: Number(settings.minOrderToRedeem),
      };
      const { data } = await axios.put(`${API}/wallet/settings`, payload);
      if (data?.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        window.alert("Wallet settings saved successfully.");
      }
    } catch (error) {
      console.error("Failed to save wallet settings", error);
      window.alert("Failed to save wallet settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Loading wallet settings...</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight="bold">
          Wallet Coins Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Customers earn coins when they book a test. Coins are saved in wallet and can be used on the next order.
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch checked={Boolean(settings.active)} name="active" onChange={handleChange} color="success" />
          <Typography>Wallet rewards active</Typography>
        </Stack>

        <TextField
          select
          fullWidth
          label="Earn Type"
          name="earnType"
          value={settings.earnType}
          onChange={handleChange}
        >
          <MenuItem value="percentage">Percentage of order</MenuItem>
          <MenuItem value="flat">Flat coins per order</MenuItem>
        </TextField>

        <TextField
          fullWidth
          type="number"
          label={settings.earnType === "percentage" ? "Earn % on order" : "Coins per order"}
          name="earnValue"
          value={settings.earnValue}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          type="number"
          label="1 coin equals (Rs)"
          name="coinValue"
          value={settings.coinValue}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          type="number"
          label="Max redeem % of payable amount"
          name="maxRedeemPercent"
          value={settings.maxRedeemPercent}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          type="number"
          label="Minimum order to earn coins (Rs)"
          name="minOrderToEarn"
          value={settings.minOrderToEarn}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          type="number"
          label="Minimum order to use coins (Rs)"
          name="minOrderToRedeem"
          value={settings.minOrderToRedeem}
          onChange={handleChange}
        />

        <Box>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Wallet Settings"}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default WalletSettingsPanel;

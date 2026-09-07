import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/hooks/useTheme";
import { createStyles } from "@/styles/auth-screen.styles";
import { KeyboardAvoidingContainer } from "./ui/keyboard-avoiding-container";
import { Loader } from "./ui/plus-loader";

export function AuthScreen() {
  const { login, register, error, clearError } = useAuth();
  const { showToast } = useToast();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const toggleMode = () => {
    setIsRegister(!isRegister);
    clearError();
    setValidationError(null);
  };

  const handleSubmit = async () => {
    clearError();
    setValidationError(null);

    if (!email || !password) {
      setValidationError("Email and Password are required");
      showToast("Email and Password are required", "error");
      return;
    }

    if (isRegister && !fullName) {
      setValidationError("Full Name is required");
      showToast("Full Name is required", "error");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, fullName, phone || undefined);
        showToast("Account created successfully!", "success");
      } else {
        await login(email, password);
        showToast("Signed in successfully!", "success");
      }
    } catch (err: any) {
      const msg = err.message || "Authentication failed";
      setValidationError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    clearError();
    setValidationError(null);
    showToast("Form cleared", "info");
  };

  const handleBack = () => {
    if (isRegister) {
      toggleMode();
    } else {
      showToast("Closing auth window", "info");
    }
  };

  if (loading && isRegister) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.background,
        }}
      >
        <Loader size={80} label="Creating mapper account... Please wait." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingContainer contentContainerStyle={styles.scrollContainer}>
      <View style={styles.innerContainer}>
        {/* Top Header Row */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.titleText}>{isRegister ? "Sign Up" : "Log In"}</Text>
        </View>

        {/* Form Body */}
        <View style={styles.formWrap}>
          {/* Email / Username Input */}
          <View
            style={[
              styles.inputRow,
              focusedField === "email" && styles.inputRowActive,
              (error || validationError) && styles.inputRowError,
            ]}
          >
            <Feather name="user" size={20} color={focusedField === "email" ? "#d97706" : "#64748b"} />
            <TextInput
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setValidationError(null);
              }}
              placeholder="Username or Email"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={styles.inputField}
            />
          </View>

          {/* Password Input */}
          <View
            style={[
              styles.inputRow,
              focusedField === "password" && styles.inputRowActive,
              (error || validationError) && styles.inputRowError,
            ]}
          >
            <Feather name="lock" size={20} color={focusedField === "password" ? "#d97706" : "#64748b"} />
            <TextInput
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setValidationError(null);
              }}
              placeholder="Password"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={styles.inputField}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Full Name & Phone (Register Mode Only) */}
          {isRegister && (
            <>
              <View
                style={[
                  styles.inputRow,
                  focusedField === "fullName" && styles.inputRowActive,
                ]}
              >
                <Feather name="info" size={20} color={focusedField === "fullName" ? "#d97706" : "#64748b"} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full Name"
                  placeholderTextColor="#64748b"
                  onFocus={() => setFocusedField("fullName")}
                  onBlur={() => setFocusedField(null)}
                  style={styles.inputField}
                />
              </View>

              <View
                style={[
                  styles.inputRow,
                  focusedField === "phone" && styles.inputRowActive,
                ]}
              >
                <Feather name="phone" size={20} color={focusedField === "phone" ? "#d97706" : "#64748b"} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone Number"
                  placeholderTextColor="#64748b"
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  style={styles.inputField}
                />
              </View>
            </>
          )}

          {/* Error Message Display */}
          {(error || validationError) && (
            <Text style={styles.errorText}>
              {validationError || error === "Incorrect password" ? "Incorrect password." : error}
            </Text>
          )}

          {/* Submit Button */}
          <View style={styles.submitBtnWrap}>
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>{isRegister ? "Sign Up" : "Log in"}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Toggle Mode */}
          <TouchableOpacity onPress={toggleMode} style={styles.toggleModeWrap}>
            <Text style={styles.toggleModeText}>
              {isRegister ? "Already have an account? " : "First time here? "}
              <Text style={styles.toggleModeHighlight}>
                {isRegister ? "Sign in." : "Sign up."}
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Area: Refresh button at bottom right */}
        <View style={styles.footerRow}>
          <TouchableOpacity onPress={handleRefresh} style={styles.footerActionBtn}>
            <Feather name="refresh-cw" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingContainer>
  );
}

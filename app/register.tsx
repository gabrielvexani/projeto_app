import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { supabase } from "../src/lib/supabase";
import { useRouter } from "expo-router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert("Erro", error.message);
    } else {
      Alert.alert("Sucesso", "Verifique seu email para confirmar a conta!");
      router.replace("/login");
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Cadastrar" onPress={handleRegister} />
      <Button title="Voltar ao Login" onPress={() => router.replace("/login")} />
    </View>
  );
}

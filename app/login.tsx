// Importa o hook useState para gerenciar estados locais
import { useState } from "react";
// Importa componentes básicos da interface do React Native
import { Alert, Button, TextInput, View } from "react-native";
// Importa a instância do Supabase para autenticação
import { supabase } from "../src/lib/supabase";
// Importa o hook de navegação do Expo Router
import { useRouter } from "expo-router";

// Componente principal de Login
export default function Login() {
  // Estado para armazenar o email digitado
  const [email, setEmail] = useState("");
  // Estado para armazenar a senha digitada
  const [password, setPassword] = useState("");
  // Hook para navegação entre páginas
  const router = useRouter();

  // Função responsável por realizar o login
  async function handleLogin() {
    // Tenta autenticar o usuário com email e senha usando Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Exibe alerta em caso de erro
      Alert.alert("Erro", error.message);
    } else {
      // Redireciona para a página de perfil em caso de sucesso
      router.replace("/profile");
    }
  }

  // Renderiza a interface de login
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      {/* Campo de texto para o email */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      {/* Campo de texto para a senha */}
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      {/* Botão para realizar login */}
      <Button title="Entrar" onPress={handleLogin} />
      {/* Botão para navegar para a página de cadastro */}
      <Button title="Cadastrar" onPress={() => router.push("/register")} />
    </View>
  );
}

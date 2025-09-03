import { useState, useEffect } from "react";
import { View, TextInput, Button, Image, Alert, TouchableOpacity, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../src/lib/supabase";
import { useRouter } from "expo-router";

export default function Profile() {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [foto, setFoto] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 🔹 Busca usuário logado
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);

        // 🔹 Busca perfil salvo no banco
        const { data: perfil, error } = await supabase
          .from("profiles")
          .select("nome, descricao, foto")
          .eq("id", data.user.id)
          .single();

        if (!error && perfil) {
          setNome(perfil.nome || "");
          setDescricao(perfil.descricao || "");
          setFoto(perfil.foto || null);
        }
      } else {
        router.replace("/login");
      }
    });
  }, []);

  async function escolherFoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Precisamos de acesso à galeria!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  }

  async function salvarPerfil() {
    if (!user) return;

    let fotoUrl = foto;

    // 🔹 Se a foto for nova (uri local), faz upload
    if (foto && foto.startsWith("file://")) {
      try {
        const fileName = `${user.id}.jpg`;

        const formData = new FormData();
        formData.append("file", {
          uri: foto,
          name: fileName,
          type: "image/jpeg",
        } as any);

        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(fileName, formData, { upsert: true });

        if (uploadError) return Alert.alert("Erro", uploadError.message);

        const { data } = supabase.storage.from("profiles").getPublicUrl(fileName);
        fotoUrl = data.publicUrl;
      } catch (err: any) {
        return Alert.alert("Erro", err.message || "Falha ao enviar a imagem");
      }
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      nome,
      descricao,
      foto: fotoUrl,
    });

    if (error) Alert.alert("Erro", error.message);
    else Alert.alert("Sucesso", "Perfil atualizado!");
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <View style={{ flex: 1, alignItems: "center", padding: 20 }}>
      {/* Foto de perfil */}
      <TouchableOpacity onPress={escolherFoto}>
        <Image
          source={{
            uri:
              foto ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png", // avatar padrão
          }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: "#ccc",
          }}
        />
        <Text style={{ textAlign: "center", color: "#007AFF" }}>
          Alterar foto
        </Text>
      </TouchableOpacity>

      {/* Campos do perfil */}
      <TextInput
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 8,
          width: "100%",
          borderRadius: 6,
        }}
      />
      <TextInput
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 8,
          width: "100%",
          borderRadius: 6,
        }}
      />

      <Button title="Salvar" onPress={salvarPerfil} />
      <View style={{ marginTop: 10 }}>
        <Button title="Sair" onPress={logout} color="red" />
      </View>
    </View>
  );
}

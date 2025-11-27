export const logoutHandler = () => {
  localStorage.removeItem("jwtToken");
  window.location.href = "/"; // 🔥 redireciona para a tela de login
};
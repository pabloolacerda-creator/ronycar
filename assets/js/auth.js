// Autenticação do painel (conta única da loja) via Supabase Auth.

import { supabase } from './supabase.js';

export async function signIn(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Liga o formulário de login e alterna entre #login e #painel conforme a sessão.
// Chama onSignedIn(session) sempre que entra uma sessão válida (inclusive ao recarregar).
// Uma sessão expirada dispara SIGNED_OUT e volta para o login automaticamente.
export function initAdminAuth({ onSignedIn } = {}) {
  const login = document.getElementById('login');
  const painel = document.getElementById('painel');
  const form = document.getElementById('form-login');
  const erro = document.getElementById('login-erro');
  const sair = document.getElementById('sair');

  function aplicar(session) {
    const autenticado = !!session;
    login.hidden = autenticado;
    painel.hidden = !autenticado;
    if (sair) sair.hidden = !autenticado;
    if (autenticado && onSignedIn) onSignedIn(session);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erro.hidden = true;
    const f = new FormData(form);
    try {
      await signIn(f.get('email'), f.get('senha'));
    } catch (err) {
      console.error(err);
      erro.textContent = 'E-mail ou senha inválidos.';
      erro.hidden = false;
    }
  });

  sair?.addEventListener('click', () => signOut());

  supabase.auth.onAuthStateChange((_event, session) => aplicar(session));
  supabase.auth.getSession().then(({ data }) => aplicar(data.session));
}

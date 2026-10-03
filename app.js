const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const authMessage = document.getElementById('authMessage');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const mekanInput = document.getElementById('mekanInput');
const mekanListesi = document.getElementById('mekanListesi');
const winnerBox = document.getElementById('winnerBox');

const state = {
  auth: null,
  db: null,
  user: null,
  firebaseReady: false
};

function isFirebaseConfigured() {
  const config = window.firebaseConfig || {};
  return Boolean(
    config.apiKey &&
    config.apiKey !== 'BURAYA_API_KEY_GELICEK' &&
    config.projectId &&
    config.projectId !== 'PROJENIZ'
  );
}

function setAuthMessage(message, type = 'error') {
  authMessage.textContent = message;
  authMessage.className = `message ${type}`;
}

function showAuth() {
  authSection.classList.remove('hidden');
  appSection.classList.add('hidden');
}

function showApp() {
  authSection.classList.add('hidden');
  appSection.classList.remove('hidden');
}

function initFirebase() {
  if (!isFirebaseConfigured()) {
    setAuthMessage('Firebase ayarlarını firebase-config.js içinden doldurmanız gerekiyor.');
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }

    state.auth = firebase.auth();
    state.db = firebase.firestore();
    state.firebaseReady = true;

    state.auth.onAuthStateChanged((user) => {
      state.user = user;
      if (user) {
        setAuthMessage('', 'success');
        showApp();
        loadPlaces();
      } else {
        showAuth();
        mekanListesi.innerHTML = '';
        winnerBox.classList.add('hidden');
      }
    });
  } catch (error) {
    setAuthMessage('Firebase başlatılırken hata oluştu: ' + error.message);
  }
}

async function signUp() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    setAuthMessage('E-posta ve şifre gerekli.');
    return;
  }

  if (!state.firebaseReady) {
    setAuthMessage('Önce Firebase API bilgilerini yapıştırın.');
    return;
  }

  try {
    await state.auth.createUserWithEmailAndPassword(email, password);
    setAuthMessage('Kayıt başarılı. Şimdi giriş yapabilirsiniz.', 'success');
    passwordInput.value = '';
  } catch (error) {
    setAuthMessage(error.message);
  }
}

async function signIn() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    setAuthMessage('E-posta ve şifre gerekli.');
    return;
  }

  if (!state.firebaseReady) {
    setAuthMessage('Önce Firebase API bilgilerini yapıştırın.');
    return;
  }

  try {
    await state.auth.signInWithEmailAndPassword(email, password);
    setAuthMessage('', 'success');
    passwordInput.value = '';
  } catch (error) {
    setAuthMessage('Giriş başarısız. Bilgileri kontrol edin.');
  }
}

async function signOut() {
  if (!state.firebaseReady) return;

  await state.auth.signOut();
  emailInput.value = '';
  passwordInput.value = '';
  mekanInput.value = '';
  winnerBox.classList.add('hidden');
}

async function addPlace() {
  const name = mekanInput.value.trim();

  if (!name) {
    return;
  }

  if (!state.firebaseReady || !state.user) {
    setAuthMessage('Önce giriş yapmanız gerekiyor.');
    return;
  }

  try {
    await state.db.collection('mekanlar').add({
      userId: state.user.uid,
      name,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    mekanInput.value = '';
    await loadPlaces();
  } catch (error) {
    setAuthMessage('Mekan eklenirken hata oluştu: ' + error.message);
  }
}

async function deletePlace(id) {
  if (!state.firebaseReady || !state.user) return;

  try {
    await state.db.collection('mekanlar').doc(id).delete();
    await loadPlaces();
  } catch (error) {
    setAuthMessage('Silme işlemi sırasında hata oluştu: ' + error.message);
  }
}

async function loadPlaces() {
  if (!state.firebaseReady || !state.user) return;

  try {
    const snapshot = await state.db
      .collection('mekanlar')
      .where('userId', '==', state.user.uid)
      .orderBy('createdAt', 'asc')
      .get();

    mekanListesi.innerHTML = '';

    if (snapshot.empty) {
      const li = document.createElement('li');
      li.textContent = 'Henüz mekan eklenmemiş.';
      li.className = 'list-item';
      mekanListesi.appendChild(li);
      return;
    }

    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement('li');
      li.className = 'list-item';

      const text = document.createElement('span');
      text.textContent = data.name;

      const delBtn = document.createElement('button');
      delBtn.textContent = '×';
      delBtn.className = 'delete-btn';
      delBtn.type = 'button';
      delBtn.addEventListener('click', () => deletePlace(doc.id));

      li.appendChild(text);
      li.appendChild(delBtn);
      mekanListesi.appendChild(li);
    });
  } catch (error) {
    setAuthMessage('Mekanlar yüklenirken hata oluştu: ' + error.message);
  }
}

function chooseRandomPlace() {
  const items = [...mekanListesi.querySelectorAll('.list-item')];
  const realItems = items.filter((item) => !item.textContent.includes('Henüz mekan eklenmemiş'));

  if (!realItems.length) {
    winnerBox.textContent = 'Önce en az bir mekan ekleyin.';
    winnerBox.classList.remove('hidden');
    return;
  }

  const winner = realItems[Math.floor(Math.random() * realItems.length)];
  const winnerName = winner.querySelector('span')?.textContent || winner.textContent;
  winnerBox.textContent = 'Gideceğiniz Mekan: ' + winnerName;
  winnerBox.classList.remove('hidden');
}

document.getElementById('signupBtn').addEventListener('click', signUp);
document.getElementById('loginBtn').addEventListener('click', signIn);
document.getElementById('logoutBtn').addEventListener('click', signOut);
document.getElementById('addPlaceBtn').addEventListener('click', addPlace);
document.getElementById('randomBtn').addEventListener('click', chooseRandomPlace);

mekanInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addPlace();
});

emailInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') signIn();
});

passwordInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') signIn();
});

window.addEventListener('DOMContentLoaded', () => {
  initFirebase();
  showAuth();
});

import { supabase } from "./lib/supabase";
import { useState, useEffect } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./App.css";
import annaPhoto from "./images/anna.jpg";
import sofiaPhoto from "./images/sofia.jpg";
import mariaPhoto from "./images/maria.jpg";

const contestants = [
  {
    id: 1,
    slug: "anna",
    name: "Анна",
    country: "Израиль",
    votes: 1543,
  },
  {
    id: 2,
    slug: "sofia",
    name: "София",
    country: "Украина",
    votes: 1238,
  },
  {
    id: 3,
    slug: "maria",
    name: "Мария",
    country: "Польша",
    votes: 987,
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <h1>👑 МИСС ТЕЛЕГРАМ</h1>
      <p>Международный конкурс красоты</p>

      <div className="card">
        <h2>🌍 Новый сезон 2026</h2>
        <p>Регистрация участниц уже открыта</p>

        <button className="vote-btn" onClick={() => navigate("/apply")}>
          📝 Отправить заявку
        </button>

        <button className="vote-btn" onClick={() => navigate("/my-applications")}>
          📋 Мои заявки
        </button>
      </div>
    </div>
  );
}

function Apply() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [about, setAbout] = useState("");
  const [photo, setPhoto] = useState("");
  const [message, setMessage] = useState("");

  function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPhoto(String(reader.result));
    };

    reader.readAsDataURL(file);
  }

  async function submitApplication() {
    if (!name || !age || !country || !city || !about || !photo) {
      setMessage("Заполните все поля и загрузите фото");
      return;
    }

    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    const slug =
      name.toLowerCase().trim().replace(/\s+/g, "-") + "-" + Date.now();

    const { error } = await supabase.from("contestants").insert({
      slug,
      name,
      age: Number(age),
      country,
      city,
      description: about,
      photo,
      status: "На модерации",
      votes: 0,
      telegram_id: telegramUser?.id || null,
    });

    if (error) {
      setMessage("Ошибка сохранения заявки ❌");
      console.log(error);
      return;
    }

    setMessage("Заявка отправлена в базу Supabase ✅");

    setName("");
    setAge("");
    setCountry("");
    setCity("");
    setAbout("");
    setPhoto("");
  }

  return (
    <div className="page">
      <h1>📝 Заявка участницы</h1>

      <div className="card">
        <input className="form-input" placeholder="Имя" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="form-input" placeholder="Возраст" value={age} onChange={(e) => setAge(e.target.value)} />
        <input className="form-input" placeholder="Страна" value={country} onChange={(e) => setCountry(e.target.value)} />
        <input className="form-input" placeholder="Город" value={city} onChange={(e) => setCity(e.target.value)} />
        <textarea className="form-input" placeholder="О себе" value={about} onChange={(e) => setAbout(e.target.value)} />

        <input
          className="form-input"
          type="file"
          accept="image/*"
          onChange={uploadPhoto}
        />

        {photo && (
          <img className="profile-photo" src={photo} alt="Фото заявки" />
        )}

        <button className="vote-btn" onClick={submitApplication}>
          🚀 Отправить заявку
        </button>

        {message && <p className="success-message">{message}</p>}
      </div>
    </div>
  );
}

function MyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);

  async function loadApplications() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setApplications(data || []);
    setLoading(false);
  }

  async function checkModerator() {
    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser || !telegramUser.id) {
      setIsModerator(false);
      return;
    }

    const { data, error } = await supabase
      .from("moderators")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      setIsModerator(false);
      return;
    }

    setIsModerator(!!data);
  }

  useEffect(() => {
    loadApplications();
    checkModerator();
  }, []);

  async function changeStatus(id: number, newStatus: string) {
    const { error } = await supabase
      .from("contestants")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.log(error);
      return;
    }

    await loadApplications();
  }

  if (loading) {
    return (
      <div className="page">
        <h1>📝 Мои заявки</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="page">
        <h1>📝 Мои заявки</h1>
        <div className="card">
          <h2>Заявок пока нет</h2>
          <p>Отправьте заявку на участие в конкурсе.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>📝 Мои заявки</h1>

      {applications.map((application) => (
        <div className="card" key={application.id}>
          <img
            className="profile-photo"
            src={application.photo}
            alt={application.name}
          />

          <h2>👑 {application.name}</h2>
          <p>🎂 Возраст: {application.age}</p>
          <p>🌍 {application.country}, {application.city}</p>
          <p>📝 {application.description}</p>
          <p>🟡 Статус: {application.status}</p>

          {isModerator && (
            <>
              <button
                className="vote-btn"
                onClick={() => changeStatus(application.id, "Одобрена")}
              >
                🟢 Одобрить
              </button>

              <button
                className="gift-btn"
                onClick={() => changeStatus(application.id, "Отклонена")}
              >
                🔴 Отклонить
              </button>

              {application.status === "Одобрена" && (
                <button
                  className="vote-btn"
                  onClick={() =>
                    changeStatus(application.id, "Опубликована в конкурсе")
                  }
                >
                  👑 Опубликовать в конкурсе
                </button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function Contestants() {
  const navigate = useNavigate();

  const [supabaseContestants, setSupabaseContestants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadContestants() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .eq("status", "Опубликована в конкурсе")
      .order("votes", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setSupabaseContestants(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadContestants();
  }, []);

  const allContestants = [...contestants, ...supabaseContestants];

  function getPhoto(contestant: any) {
    if (contestant.photo) return contestant.photo;
    if (contestant.slug === "sofia") return sofiaPhoto;
    if (contestant.slug === "maria") return mariaPhoto;
    return annaPhoto;
  }

  if (loading) {
    return (
      <div className="page">
        <h1>👑 Участницы</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>👑 Участницы</h1>

      {allContestants.map((contestant) => (
        <div
          key={`${contestant.slug}-${contestant.id}`}
          className="card"
          onClick={() => navigate(`/contestant/${contestant.slug}`)}
          style={{ cursor: "pointer" }}
        >
          <img
            className="contestant-photo"
            src={getPhoto(contestant)}
            alt={contestant.name}
          />

          <h2>👑 {contestant.name}</h2>
          <p>🌍 {contestant.country}</p>
          <p>⭐ {contestant.votes} голосов</p>
        </div>
      ))}
    </div>
  );
}
function ContestantProfile({
  balance,
  setBalance,
  spentStars,
  setSpentStars,
  sentGifts,
  setSentGifts,
}: {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  spentStars: number;
  setSpentStars: React.Dispatch<React.SetStateAction<number>>;
  sentGifts: number;
  setSentGifts: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { slug } = useParams();

  const savedPublished = localStorage.getItem("publishedContestants");
  const publishedContestants = savedPublished ? JSON.parse(savedPublished) : [];

  const allContestants = [...contestants, ...publishedContestants];

  const contestant = allContestants.find((item) => item.slug === slug);

  const savedVotes = Number(localStorage.getItem(`votes_${slug}`));

  const [votes, setVotes] = useState(savedVotes || contestant?.votes || 0);
  const [gifts, setGifts] = useState(320);
  const [message, setMessage] = useState("");

  if (!contestant) {
    return (
      <div className="page">
        <h1>Участница не найдена</h1>
      </div>
    );
  }

  function vote() {
    const price = 100;

    if (balance < price) {
      setMessage("Недостаточно Stars ⭐");
      return;
    }

    const newVotes = votes + 1;

    setBalance(balance - price);
    setSpentStars(spentStars + price);
    setVotes(newVotes);
    localStorage.setItem(`votes_${slug}`, String(newVotes));
    setMessage("Спасибо за голос! ⭐");
  }

  function sendGift(giftName: string, price: number) {
    if (balance < price) {
      setMessage("Недостаточно Stars ⭐");
      return;
    }

    setBalance(balance - price);
    setSpentStars(spentStars + price);
    setSentGifts(sentGifts + 1);
    setGifts(gifts + 1);
    setMessage(`Подарок отправлен: ${giftName} 🎁`);
  }

  let photo = contestant.photo || annaPhoto;

  if (contestant.slug === "sofia") {
    photo = sofiaPhoto;
  }

  if (contestant.slug === "maria") {
    photo = mariaPhoto;
  }

  return (
    <div className="page">
      <h1>👑 {contestant.name}</h1>

      <img className="profile-photo" src={photo} alt={contestant.name} />

      <div className="card">
        <h2>⭐ Мой баланс</h2>
        <p>{balance} Stars</p>
        <p>Потрачено: {spentStars} Stars</p>
      </div>

      <div className="card">
        <h2>🌍 {contestant.country}</h2>
        <p>⭐ {votes} голосов</p>
        <p>🎁 {gifts} подарков</p>
        <p>🏆 Место: {contestant.id}</p>
      </div>

      <div className="card">
        <h2>О себе</h2>
        <p>Участница конкурса MISS TELEGRAM.</p>
      </div>

      <div className="card">
        <h2>⭐ Голосование</h2>

        <button className="vote-btn" onClick={vote}>
          ⭐ Голосовать за 100 Stars
        </button>
      </div>

      <div className="card">
        <h2>🎁 Подарки</h2>

        <div className="gift-list">
          <button className="gift-btn" onClick={() => sendGift("Роза", 50)}>
            🌹 Роза — 50 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Букет", 100)}>
            💐 Букет — 100 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Мишка", 250)}>
            🧸 Мишка — 250 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Сердце", 300)}>
            ❤️ Сердце — 300 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Бриллиант", 500)}>
            💎 Бриллиант — 500 Stars
          </button>

          <button className="gift-btn" onClick={() => sendGift("Корона", 1000)}>
            👑 Корона — 1000 Stars
          </button>
        </div>

        {message && <p className="success-message">{message}</p>}
      </div>
    </div>
  );
}

function Rating() {
  const savedPublished = localStorage.getItem("publishedContestants");
  const publishedContestants = savedPublished ? JSON.parse(savedPublished) : [];

  const allContestants = [...contestants, ...publishedContestants];

  const contestantsWithSavedVotes = allContestants.map((contestant) => {
    const savedVotes = Number(localStorage.getItem(`votes_${contestant.slug}`));

    return {
      ...contestant,
      votes: savedVotes || contestant.votes,
    };
  });

  const sortedContestants = [...contestantsWithSavedVotes].sort(
    (a, b) => b.votes - a.votes
  );

  return (
    <div className="page">
      <h1>🏆 Рейтинг</h1>

      {sortedContestants.map((contestant, index) => (
        <div key={contestant.id} className="card">
          <h2>
            {index + 1} место — {contestant.name}
          </h2>
          <p>🌍 {contestant.country}</p>
          <p>⭐ {contestant.votes} голосов</p>
        </div>
      ))}
    </div>
  );
}

function Profile({
  balance,
  spentStars,
  sentGifts,
  setBalance,
}: {
  balance: number;
  spentStars: number;
  sentGifts: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [paymentMessage, setPaymentMessage] = useState("");

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  const tgUser = telegramUser || {
    first_name: "Тестовый пользователь",
    last_name: "",
    username: "test_user",
    id: 123456789,
    photo_url: "https://i.pravatar.cc/300",
  };

  const fullName = `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim();

  function buyStars() {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      setBalance(balance + 500);
      setPaymentMessage("Тестовое пополнение: +500 Stars ✅");
      return;
    }

    setPaymentMessage("Telegram Mini App подключён ✅ Оплату Stars подключим следующим шагом.");
  }

  return (
    <div className="page">
      <h1>👤 Профиль</h1>

      <div className="card">
        <img
          src={tgUser.photo_url || "https://i.pravatar.cc/300"}
          alt="avatar"
          className="profile-photo"
        />

        <h2>{fullName || "Telegram User"}</h2>

        {tgUser.username && <p>@{tgUser.username}</p>}

        <p>ID: {tgUser.id}</p>
      </div>

      <div className="card">
        <h2>⭐ Мой баланс</h2>
        <p>{balance} Stars</p>

        <button className="vote-btn" onClick={buyStars}>
          💳 Купить 500 Stars
        </button>

        {paymentMessage && <p className="success-message">{paymentMessage}</p>}
      </div>

      <div className="card">
        <h2>🎁 Отправлено подарков</h2>
        <p>{sentGifts}</p>
      </div>

      <div className="card">
        <h2>⭐ Потрачено Stars</h2>
        <p>{spentStars}</p>
      </div>
    </div>
  );
}

function App() {
  const [balance, setBalance] = useState(() => {
    return Number(localStorage.getItem("balance")) || 1250;
  });

  const [spentStars, setSpentStars] = useState(() => {
    return Number(localStorage.getItem("spentStars")) || 0;
  });

  const [sentGifts, setSentGifts] = useState(() => {
    return Number(localStorage.getItem("sentGifts")) || 38;
  });

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("balance", String(balance));
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("spentStars", String(spentStars));
  }, [spentStars]);

  useEffect(() => {
    localStorage.setItem("sentGifts", String(sentGifts));
  }, [sentGifts]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/contestants" element={<Contestants />} />

        <Route
          path="/contestant/:slug"
          element={
            <ContestantProfile
              balance={balance}
              setBalance={setBalance}
              spentStars={spentStars}
              setSpentStars={setSpentStars}
              sentGifts={sentGifts}
              setSentGifts={setSentGifts}
            />
          }
        />

        <Route path="/rating" element={<Rating />} />

        <Route
          path="/profile"
          element={
            <Profile
              balance={balance}
              spentStars={spentStars}
              sentGifts={sentGifts}
              setBalance={setBalance}
            />
          }
        />
      </Routes>

      <nav className="bottom-nav">
        <Link to="/">🏠 Главная</Link>
        <Link to="/contestants">👑 Участницы</Link>
        <Link to="/rating">🏆 Рейтинг</Link>
        <Link to="/profile">👤 Профиль</Link>
      </nav>
    </BrowserRouter>
  );
}

export default App;
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

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  const isAdmin = telegramUser?.id === 678312754;

  return (
    <div className="page">
      <h1>👑 МИСС ТЕЛЕГРАМ</h1>
      <p>Международный конкурс красоты</p>

      <div className="card">
        <h2>🌍 Новый сезон 2026</h2>
        <p>Регистрация участниц уже открыта</p>

        <button
          className="vote-btn"
          onClick={() => navigate("/apply")}
        >
          📝 Отправить заявку
        </button>

        <button
          className="vote-btn"
          onClick={() => navigate("/my-applications")}
        >
          📋 Мои заявки
        </button>

        {isAdmin && (
          <button
            className="vote-btn"
            onClick={() => navigate("/admin")}
          >
            👮 Модераторы
          </button>
        )}
      </div>
    </div>
  );
}

function Admin() {
  const [telegramId, setTelegramId] = useState("");
  const [name, setName] = useState("");
  const [moderators, setModerators] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  const isAdmin = telegramUser?.id === 678312754;

  async function loadModerators() {
    const { data, error } = await supabase
      .from("moderators")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setModerators(data || []);
  }

  useEffect(() => {
    loadModerators();
  }, []);

  async function addModerator() {
    if (!telegramId || !name) {
      setMessage("Введите Telegram ID и имя");
      return;
    }

    const { error } = await supabase.from("moderators").insert({
      telegram_id: Number(telegramId),
      name,
      role: "moderator",
    });

    if (error) {
      console.log(error);
      alert(JSON.stringify(error));
      setMessage(error.message);
      return;
    }

    setTelegramId("");
    setName("");
    setMessage("Модератор добавлен ✅");
    await loadModerators();
  }

  async function deleteModerator(id: number, role: string) {
    if (role === "admin") {
      setMessage("Админа удалить нельзя");
      return;
    }

    const { error } = await supabase
      .from("moderators")
      .delete()
      .eq("id", id);

    if (error) {
      console.log(error);
      alert(JSON.stringify(error));
      setMessage(error.message);
      return;
    }

    setMessage("Модератор удалён");
    await loadModerators();
  }

  if (!isAdmin) {
    return (
      <div className="page">
        <h1>⛔ Доступ запрещён</h1>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>👮 Модераторы</h1>

      <div className="card">
        <input
          className="form-input"
          placeholder="Telegram ID"
          value={telegramId}
          onChange={(e) => setTelegramId(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="vote-btn" onClick={addModerator}>
          ➕ Добавить модератора
        </button>

        {message && <p className="success-message">{message}</p>}
      </div>

      {moderators.map((moderator) => (
        <div className="card" key={moderator.id}>
          <h2>{moderator.name}</h2>
          <p>ID: {moderator.telegram_id}</p>
          <p>Роль: {moderator.role}</p>

          {moderator.role !== "admin" && (
            <button
              className="gift-btn"
              onClick={() => deleteModerator(moderator.id, moderator.role)}
            >
              🗑 Удалить
            </button>
          )}
        </div>
      ))}
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
  const [loading, setLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [canSubmitMany, setCanSubmitMany] = useState(false);

  async function checkAccess() {
    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setLoading(false);
      return;
    }

    const { data: moderatorData } = await supabase
      .from("moderators")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    const isModerator = !!moderatorData;
    setCanSubmitMany(isModerator);

    if (!isModerator) {
      const { data } = await supabase
        .from("contestants")
        .select("*")
        .eq("telegram_id", telegramUser.id)
        .order("created_at", { ascending: false });

      const applications = data || [];
      setApplicationsCount(applications.length);
      setExistingApplication(applications[0] || null);
    }

    setLoading(false);
  }

  useEffect(() => {
    checkAccess();
  }, []);

  function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

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

    if (!telegramUser?.id) {
      setMessage("Откройте приложение через Telegram");
      return;
    }

    if (!canSubmitMany) {
      if (applicationsCount >= 5) {
        setMessage("Лимит заявок исчерпан: максимум 5 заявок");
        return;
      }

      if (
        existingApplication &&
        existingApplication.status !== "Отклонена"
      ) {
        setMessage("У вас уже есть активная заявка");
        return;
      }
    }

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
      telegram_id: telegramUser.id,
    });

    if (error) {
      console.log(error);
      setMessage("Ошибка сохранения заявки ❌");
      return;
    }

    setMessage("Заявка отправлена ✅");

    setName("");
    setAge("");
    setCountry("");
    setCity("");
    setAbout("");
    setPhoto("");

    await checkAccess();
  }

  if (loading) {
    return (
      <div className="page">
        <h1>📝 Заявка участницы</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (
    !canSubmitMany &&
    existingApplication &&
    existingApplication.status !== "Отклонена"
  ) {
    return (
      <div className="page">
        <h1>📝 Заявка участницы</h1>

        <div className="card">
          <img
            className="profile-photo"
            src={existingApplication.photo}
            alt={existingApplication.name}
          />

          <h2>У вас уже есть активная заявка</h2>
          <p>👑 {existingApplication.name}</p>
          <p>🎂 Возраст: {existingApplication.age}</p>
          <p>
            🌍 {existingApplication.country}, {existingApplication.city}
          </p>
          <p>📝 {existingApplication.description}</p>
          <p>🟡 Статус: {existingApplication.status}</p>
        </div>
      </div>
    );
  }

  if (!canSubmitMany && applicationsCount >= 5) {
    return (
      <div className="page">
        <h1>📝 Заявка участницы</h1>

        <div className="card">
          <h2>Лимит заявок исчерпан</h2>
          <p>Вы уже отправили максимум 5 заявок.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>📝 Заявка участницы</h1>

      {!canSubmitMany && existingApplication?.status === "Отклонена" && (
        <div className="card">
          <h2>Предыдущая заявка отклонена</h2>
          <p>Вы можете отправить новую заявку.</p>
          <p>Использовано заявок: {applicationsCount} из 5</p>
        </div>
      )}

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
  const [isAdmin, setIsAdmin] = useState(false);

  async function checkAdmin() {
    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setIsAdmin(false);
      return false;
    }

    const { data, error } = await supabase
      .from("moderators")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.log(error);
      setIsAdmin(false);
      return false;
    }

    const result = !!data;
    setIsAdmin(result);
    return result;
  }

  async function loadApplications() {
    setLoading(true);

    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    const admin = await checkAdmin();

    let query = supabase
      .from("contestants")
      .select("*")
      .order("created_at", { ascending: false });

    if (!admin) {
      if (!telegramUser?.id) {
        setApplications([]);
        setLoading(false);
        return;
      }

      query = query.eq("telegram_id", telegramUser.id);
    }

    const { data, error } = await query;

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setApplications(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function changeStatus(id: number, newStatus: string) {
    const finalStatus =
      newStatus === "Одобрена" ? "Опубликована в конкурсе" : newStatus;

    const { error } = await supabase
      .from("contestants")
      .update({ status: finalStatus })
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

          {isAdmin && application.status === "На модерации" && (
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
  const [roleText, setRoleText] = useState("👤 Участник");

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

  async function loadUserRole() {
    if (!telegramUser?.id) {
      setRoleText("👤 Участник");
      return;
    }

    const { data } = await supabase
      .from("moderators")
      .select("role")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    if (data?.role === "admin") {
      setRoleText("👑 Админ");
      return;
    }

    if (data?.role === "moderator") {
      setRoleText("👮 Модератор");
      return;
    }

    if (data?.role === "ambassador") {
      setRoleText("⭐ Амбассадор");
      return;
    }

    setRoleText("👤 Участник");
  }

  useEffect(() => {
    loadUserRole();
  }, []);

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
        <p>Роль: {roleText}</p>
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
        <Route path="/admin" element={<Admin />} />

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
import { supabase } from "./lib/supabase";
import { useState, useEffect } from "react";
import heroGirl from "./assets/hero-girl-fireworks.png";
import crownGold from "./assets/crown-gold.png";

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
    <div className="page home-page">
      <h1 className="main-title">
	  <img src={crownGold} alt="" className="main-crown" />
	  MISS TELEGRAM
	  <img src={crownGold} alt="" className="main-crown" />
	  </h1>
      <p>Международный конкурс красоты</p>

      <div className="home-hero">
        <div className="home-hero-text">
          <h2>🌍 Новый сезон</h2>
          <div className="home-year">2026</div>
          <p>Регистрируйся, участвуй и побеждай!</p>

          <button className="vote-btn home-main-btn" onClick={() => navigate("/apply")}>
            Отправить заявку
          </button>
        </div>

        <img className="home-girl" src={heroGirl} alt="MISS TELEGRAM" />
      </div>

      <div className="home-grid">
        <div className="home-small-card" onClick={() => navigate("/my-applications")}>
          <h2>📝 Мои заявки</h2>
          <p>Посмотреть свои заявки ›</p>
        </div>

        <div className="home-small-card" onClick={() => navigate("/contestants")}>
          <h2>👥 Участницы</h2>
          <p>Смотри и поддерживай ›</p>
        </div>
      </div>

      <div className="home-wide-card" onClick={() => navigate("/ambassador")}>
        <div className="home-icon">🤝</div>
        <div>
          <h2>Амбассадор</h2>
          <p>Приглашай участниц и зрителей и получай вознаграждение ›</p>
        </div>
      </div>

      <div className="home-wide-card" onClick={() => navigate("/rules")}>
        <div className="home-icon">📜</div>
        <div>
          <h2>Условия конкурса</h2>
          <p>
            • Правила участия<br />
            • Призовой фонд<br />
            • Выплаты<br />
            • Модерация ›
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="home-wide-card" onClick={() => navigate("/admin")}>
          <div className="home-icon">👮</div>
          <div>
            <h2>Модераторы</h2>
            <p>Панель управления модераторами ›</p>
          </div>
        </div>
      )}

      <h2 className="home-section-title">Конкурс в цифрах</h2>

      <div className="home-stats">
        <div>
          <div>👑</div>
          <strong>500+</strong>
          <span>Участниц</span>
        </div>

        <div>
          <div>⭐</div>
          <strong>25K+</strong>
          <span>Голосов</span>
        </div>

        <div>
          <div>🎁</div>
          <strong>10K+</strong>
          <span>Подарков</span>
        </div>

        <div>
          <div>👥</div>
          <strong>50K+</strong>
          <span>Зрителей</span>
        </div>
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
      telegram_username: telegramUser.username || null,
      telegram_first_name: telegramUser.first_name || null,
      telegram_last_name: telegramUser.last_name || null,
    });

    if (error) {
      console.log(error);
      setMessage(error?.message || "Ошибка сохранения заявки ❌");
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
        <input
          className="form-input"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Возраст"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Страна"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Город"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="О себе"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />

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

        {message && (
          <p className="success-message" style={{ whiteSpace: "pre-line" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

function MyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user");

  function getTelegramUser() {
    return (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  }

  function getTelegramName(user: any) {
    return `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.username || "Moderator";
  }

  async function loadRole() {
    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setUserRole("user");
      return "user";
    }

    const { data, error } = await supabase
      .from("moderators")
      .select("role")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      setUserRole("user");
      return "user";
    }

    const role = data?.role || "user";
    setUserRole(role);
    return role;
  }

  async function loadApplications() {
    setLoading(true);

    const telegramUser = getTelegramUser();
    const role = await loadRole();

    let query = supabase
      .from("contestants")
      .select("*")
      .order("created_at", { ascending: false });

    if (role === "admin") {
      // админ видит все заявки
    } else if (role === "moderator") {
      if (!telegramUser?.id) {
        setApplications([]);
        setLoading(false);
        return;
      }

      query = query.or(
        `status.eq.На модерации,moderated_by.eq.${telegramUser.id}`
      );
    } else {
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
    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      return;
    }

    const finalStatus =
      newStatus === "Одобрена" ? "Опубликована в конкурсе" : newStatus;

    const { error } = await supabase
  .from("contestants")
  .update({
    status: finalStatus,
    moderated_by: telegramUser.id,
    moderated_by_name: getTelegramName(telegramUser),

    approval_notification_sent:
      finalStatus === "Опубликована в конкурсе"
        ? false
        : null,

    rejection_notification_sent:
      finalStatus === "Отклонена"
        ? false
        : null,
  })
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
        <h1>📋 Заявки</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="page">
        <h1>📋 Заявки</h1>
        <div className="card">
          <h2>Заявок пока нет</h2>
          <p>Новых заявок на модерацию нет.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>📋 Заявки</h1>

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

          {application.moderated_by_name && (
            <p>👮 Обработал: {application.moderated_by_name}</p>
          )}

          {(userRole === "admin" || userRole === "moderator") &&
            application.status === "На модерации" && (
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

  const [contestantsList, setContestantsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function getVotesCount(contestantId: number) {
    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("contestant_id", contestantId);

    if (error) {
      console.log(error);
      return 0;
    }

    return count || 0;
  }

  async function getGiftsCount(contestantId: number) {
    const { count, error } = await supabase
      .from("gifts")
      .select("*", { count: "exact", head: true })
      .eq("contestant_id", contestantId);

    if (error) {
      console.log(error);
      return 0;
    }

    return count || 0;
  }

  async function loadContestants() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .eq("status", "Опубликована в конкурсе")
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const publishedFromSupabase = data || [];

    const allContestants = [...contestants, ...publishedFromSupabase];

    const contestantsWithStats = await Promise.all(
      allContestants.map(async (contestant) => {
        const realVotes = await getVotesCount(contestant.id);
        const realGifts = await getGiftsCount(contestant.id);

        return {
          ...contestant,
          realVotes,
          realGifts,
        };
      })
    );

    contestantsWithStats.sort((a, b) => b.realVotes - a.realVotes);

    setContestantsList(contestantsWithStats);
    setLoading(false);
  }

  useEffect(() => {
    loadContestants();
  }, []);

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

      {contestantsList.map((contestant) => (
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
          <p>⭐ {contestant.realVotes} голосов</p>
          <p>🎁 {contestant.realGifts} подарков</p>
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

  const [votes, setVotes] = useState(0);
  const [gifts, setGifts] = useState(0);
  const [voteMessage, setVoteMessage] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  async function loadVotes() {
    if (!contestant?.id) return;

    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("contestant_id", contestant.id);

    if (error) {
      setVoteMessage(error.message);
      return;
    }

    setVotes(count || 0);
  }

  async function loadGifts() {
    if (!contestant?.id) return;

    const { count, error } = await supabase
      .from("gifts")
      .select("*", { count: "exact", head: true })
      .eq("contestant_id", contestant.id);

    if (error) {
      setGiftMessage(error.message);
      return;
    }

    setGifts(count || 0);
  }

  useEffect(() => {
    loadVotes();
    loadGifts();
  }, [contestant?.id]);

  if (!contestant) {
    return (
      <div className="page">
        <h1>Участница не найдена</h1>
      </div>
    );
  }

  async function vote() {
    const price = 100;

    setVoteMessage("");
    setGiftMessage("");

    if (balance < price) {
      setVoteMessage("Недостаточно Stars ⭐");
      return;
    }

    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setVoteMessage("Откройте приложение через Telegram");
      return;
    }

    const todayUtc = new Date().toISOString().slice(0, 10);

    const { error } = await supabase.from("votes").insert({
      contestant_id: contestant.id,
      telegram_id: telegramUser.id,
      vote_day: todayUtc,
    });

    if (error) {
      if (
        error.message.includes("one_vote_per_day") ||
        error.code === "23505"
      ) {
        setVoteMessage(
          "⭐ Вы уже голосовали за эту участницу сегодня.\n\n🕛 Следующий голос будет доступен завтра.\n\nПоддержите пока других участниц 👑"
        );
        return;
      }

      setVoteMessage(error.message);
      return;
    }

    setBalance(balance - price);
    setSpentStars(spentStars + price);

    await loadVotes();

    setVoteMessage("🎉 Спасибо за голос! ⭐");
  }

  async function sendGift(giftName: string, price: number) {
    setVoteMessage("");
    setGiftMessage("");

    if (balance < price) {
      setGiftMessage("Недостаточно Stars ⭐");
      return;
    }

    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setGiftMessage("Откройте приложение через Telegram");
      return;
    }

    const { error } = await supabase.from("gifts").insert({
      contestant_id: contestant.id,
      telegram_id: telegramUser.id,
      gift_name: giftName,
      price,
    });

    if (error) {
      setGiftMessage(error.message);
      return;
    }

    setBalance(balance - price);
    setSpentStars(spentStars + price);
    setSentGifts(sentGifts + 1);

    await loadGifts();

    setGiftMessage(`🎁 Спасибо! Подарок отправлен: ${giftName}`);
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
        <h2>🌍 {contestant.country}</h2>
        <p>⭐ Голосов: {votes}</p>
        <p>🎁 Подарков: {gifts}</p>
        <p>🏆 Место: {contestant.id}</p>
      </div>

      <div className="card">
        <h2>⭐ Голосование</h2>
        <p>Сейчас у участницы: {votes} голосов</p>

        <button className="vote-btn" onClick={vote}>
          ⭐ Голосовать за 100 Stars
        </button>

        {voteMessage && (
          <p className="success-message" style={{ whiteSpace: "pre-line" }}>
            {voteMessage}
          </p>
        )}
      </div>

      <div className="card">
        <h2>⭐ Мой баланс</h2>
        <p>{balance} Stars</p>
        <p>Потрачено: {spentStars} Stars</p>
      </div>

      <div className="card">
        <h2>О себе</h2>
        <p>Участница конкурса MISS TELEGRAM.</p>
      </div>

      <div className="card">
        <h2>🎁 Подарки</h2>

        {giftMessage && (
          <p className="success-message" style={{ whiteSpace: "pre-line" }}>
            {giftMessage}
          </p>
        )}

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
      </div>
    </div>
  );
}

function Rating() {
  const [ratingList, setRatingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function getVotesCount(contestantId: number) {
    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("contestant_id", contestantId);

    if (error) {
      console.log(error);
      return 0;
    }

    return count || 0;
  }

  async function loadRating() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .eq("status", "Опубликована в конкурсе");

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    const publishedFromSupabase = data || [];

    const allContestants = [...contestants, ...publishedFromSupabase];

    const contestantsWithVotes = await Promise.all(
      allContestants.map(async (contestant) => {
        const realVotes = await getVotesCount(contestant.id);

        return {
          ...contestant,
          realVotes,
        };
      })
    );

    contestantsWithVotes.sort((a, b) => b.realVotes - a.realVotes);

    setRatingList(contestantsWithVotes);
    setLoading(false);
  }

  useEffect(() => {
    loadRating();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1>🏆 Рейтинг</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>🏆 Рейтинг</h1>

      {ratingList.map((contestant, index) => (
        <div key={contestant.id} className="card">
          <h2>
            {index + 1} место — {contestant.name}
          </h2>

          <p>🌍 {contestant.country}</p>
          <p>⭐ {contestant.realVotes} голосов</p>
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
    const { data } = await supabase
      .from("moderators")
      .select("role")
      .eq("telegram_id", tgUser.id)
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
      </div>

      <div className="card">
        <h2>🏷 Моя роль</h2>
        <p>{roleText}</p>
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

function StarRating() {
  return (
    <div className="page">
      <h1>🎁 MISS TELEGRAM STAR</h1>
      <p>Рейтинг по подаркам</p>

      <div className="card">
        <h2>Скоро будет доступно</h2>
        <p>Здесь будет рейтинг участниц по подаркам и Stars.</p>
      </div>
    </div>
  );
}

function Ambassador() {
  return (
    <div className="page">
      <h1>🤝 Амбассадор</h1>

      <div className="card">
        <h2>Приглашай участниц и зрителей</h2>
        <p>И получай вознаграждение за развитие MISS TELEGRAM.</p>
      </div>
    </div>
  );
}

function Rules() {
  return (
    <div className="page">
      <h1>📜 Условия конкурса</h1>

      <div className="card">
        <h2>Правила участия</h2>
        <p>
          • Участие 18+
          <br />
          • Фото проходят модерацию
          <br />
          • Призовые фонды будут объявлены отдельно
          <br />
          • Выплаты по правилам конкурса
        </p>
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

  const [_pendingCount, setPendingCount] = useState(0);
  const [_userRole, setUserRole] = useState("user");

  async function loadPendingCount() {
    const telegramUser =
      (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
      setPendingCount(0);
      setUserRole("user");
      return;
    }

    const { data: roleData } = await supabase
      .from("moderators")
      .select("role")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    const role = roleData?.role || "user";
    setUserRole(role);

    if (role !== "admin" && role !== "moderator") {
      setPendingCount(0);
      return;
    }

    const { count, error } = await supabase
      .from("contestants")
      .select("*", { count: "exact", head: true })
      .eq("status", "На модерации");

    if (error) {
      console.log(error);
      setPendingCount(0);
      return;
    }

    setPendingCount(count || 0);
  }

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
    }

    loadPendingCount();

    const interval = setInterval(() => {
      loadPendingCount();
    }, 15000);

    return () => clearInterval(interval);
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
		
<Route path="/star-rating" element={<StarRating />} />
<Route path="/ambassador" element={<Ambassador />} />
<Route path="/rules" element={<Rules />} />

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
		<Link to="/star-rating">🎁 STAR</Link>
        <Link to="/profile">👤 Профиль</Link>
      </nav>
    </BrowserRouter>
  );
}

export default App;
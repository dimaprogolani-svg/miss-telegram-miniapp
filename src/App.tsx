import { supabase } from "./lib/supabase";
import { useState, useEffect } from "react";
import heroGirl from "./assets/hero-girl-fireworks.png";

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



function Home() {
  const navigate = useNavigate();

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  const isAdmin = telegramUser?.id === 678312754;

  return (
    <div className="page home-page">
      <h1 className="premium-title">
	  <span className="premium-crown"></span>
	  <span className="premium-title-text">MISS TELEGRAM</span>
	   <span className="premium-crown"></span>
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
          <p>Приглашай участниц и зрителей  ›</p>
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

  const [height, setHeight] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");

  const [aboutShort, setAboutShort] = useState("");
  const [occupation, setOccupation] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [participationReason, setParticipationReason] = useState("");
  const [dream, setDream] = useState("");
  const [beautyMeaning, setBeautyMeaning] = useState("");
  const [talent, setTalent] = useState("");
  const [messageToViewers, setMessageToViewers] = useState("");
  const [socialLink, setSocialLink] = useState("");

  const [photo, setPhoto] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [canSubmitMany, setCanSubmitMany] = useState(false);

  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [mediaPermission, setMediaPermission] = useState(false);

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
    if (
      !name ||
      !age ||
      !country ||
      !city ||
      !height ||
      !maritalStatus ||
      !aboutShort ||
      !occupation ||
      !hobbies ||
      !participationReason ||
      !dream ||
      !beautyMeaning ||
      !talent ||
      !messageToViewers ||
      !photo
    ) {
      setMessage("Заполните все обязательные поля и загрузите фото");
      return;
    }

    if (!rulesAccepted || !mediaPermission) {
      setMessage("Нужно подтвердить согласие с правилами и разрешение на использование фото/видео");
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

    const codeLetters = `${name[0] || "X"}${country[0] || "X"}${city[0] || "X"}`.toUpperCase();
    const contestantCode = `${codeLetters}-${Date.now().toString().slice(-3)}`;

    const description = `
Кратко о себе: ${aboutShort}

Чем занимается: ${occupation}

Хобби: ${hobbies}

Почему участвует: ${participationReason}

Мечта: ${dream}

Что для неё красота: ${beautyMeaning}

Главный талант: ${talent}

Обращение к зрителям: ${messageToViewers}

Соцсети: ${socialLink || "не указано"}
`;

    const { error } = await supabase.from("contestants").insert({
      slug,
      name,
      age: Number(age),
      country,
      city,
      description,
      photo,
      photo_1: photo,
      status: "На модерации",
      votes: 0,
      contestant_code: contestantCode,

      height,
      marital_status: maritalStatus,
      about_short: aboutShort,
      occupation,
      hobbies,
      participation_reason: participationReason,
      dream,
      beauty_meaning: beautyMeaning,
      talent,
      message_to_viewers: messageToViewers,
      social_link: socialLink || null,

      rules_accepted: rulesAccepted,
      media_permission: mediaPermission,

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
    setHeight("");
    setMaritalStatus("");
    setAboutShort("");
    setOccupation("");
    setHobbies("");
    setParticipationReason("");
    setDream("");
    setBeautyMeaning("");
    setTalent("");
    setMessageToViewers("");
    setSocialLink("");
    setPhoto("");
    setRulesAccepted(false);
    setMediaPermission(false);

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
          <p>🆔 Код: {existingApplication.contestant_code}</p>
          <p>🎂 Возраст: {existingApplication.age}</p>
          <p>
            🌍 {existingApplication.country}, {existingApplication.city}
          </p>
          <p>📏 Рост: {existingApplication.height || "не указан"}</p>
          <p>💍 Семейное положение: {existingApplication.marital_status || "не указано"}</p>
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
        <h2>Основные данные</h2>

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

        <input
          className="form-input"
          placeholder="Рост"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="Семейное положение"
          value={maritalStatus}
          onChange={(e) => setMaritalStatus(e.target.value)}
        />
      </div>

      <div className="card">
        <h2>Анкета участницы</h2>

        <textarea
          className="form-input"
          placeholder="1. Кратко о себе"
          value={aboutShort}
          onChange={(e) => setAboutShort(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="2. Чем вы занимаетесь?"
          value={occupation}
          onChange={(e) => setOccupation(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="3. Ваши хобби?"
          value={hobbies}
          onChange={(e) => setHobbies(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="4. Почему вы участвуете в MISS TELEGRAM?"
          value={participationReason}
          onChange={(e) => setParticipationReason(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="5. Ваша мечта?"
          value={dream}
          onChange={(e) => setDream(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="6. Что для вас красота?"
          value={beautyMeaning}
          onChange={(e) => setBeautyMeaning(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="7. Какой ваш главный талант?"
          value={talent}
          onChange={(e) => setTalent(e.target.value)}
        />

        <textarea
          className="form-input"
          placeholder="8. Что вы хотите сказать зрителям?"
          value={messageToViewers}
          onChange={(e) => setMessageToViewers(e.target.value)}
        />

        <input
          className="form-input"
          placeholder="9. Instagram / Telegram / TikTok (необязательно)"
          value={socialLink}
          onChange={(e) => setSocialLink(e.target.value)}
        />
      </div>

      <div className="card">
        <h2>Фото</h2>
        <p>📸 Фото №1 — обязательно</p>

        <input
          className="form-input"
          type="file"
          accept="image/*"
          onChange={uploadPhoto}
        />

        {photo && (
          <img className="profile-photo" src={photo} alt="Фото заявки" />
        )}
      </div>

      <div className="card">
        <h2>Согласие</h2>

        <label>
          <input
            type="checkbox"
            checked={rulesAccepted}
            onChange={(e) => setRulesAccepted(e.target.checked)}
          />
          {" "}Я согласна с правилами конкурса
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={mediaPermission}
            onChange={(e) => setMediaPermission(e.target.checked)}
          />
          {" "}Разрешаю использовать мои фото и видео в рамках MISS TELEGRAM
        </label>
      </div>

      <div className="card">
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
    return (
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      user?.username ||
      "Moderator"
    );
  }

  function shareContestant(application: any) {
    const link = `https://miss-telegram-miniapp.vercel.app/contestant/${application.slug}`;

    const text = `👑 Поддержите меня в международном конкурсе красоты MISS TELEGRAM!

🆔 Мой номер участницы: ${application.contestant_code || "не указан"}

Буду благодарна за ваш голос и поддержку ❤️

⭐ Голосовать и отправлять подарки можно по ссылке:
${link}`;

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      link
    )}&text=${encodeURIComponent(text)}`;

    window.open(shareUrl, "_blank");
  }

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

  async function getGiftStars(contestantId: number) {
    const { data, error } = await supabase
      .from("gifts")
      .select("price")
      .eq("contestant_id", contestantId);

    if (error) {
      console.log(error);
      return 0;
    }

    return (data || []).reduce((sum: number, gift: any) => {
      return sum + (gift.price || 0);
    }, 0);
  }

  async function loadRole() {
  const telegramUser = getTelegramUser();

  if (!telegramUser?.id) {
    setUserRole("user");
    return "user";
  }

  if (telegramUser.id === 678312754) {
    setUserRole("admin");
    return "admin";
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

    const applicationsWithStats = await Promise.all(
      (data || []).map(async (application: any) => {
        const votes = await getVotesCount(application.id);
        const gifts = await getGiftsCount(application.id);
        const giftStars = await getGiftStars(application.id);

        return {
          ...application,
          realVotes: votes,
          realGifts: gifts,
          giftStars,
        };
      })
    );

    setApplications(applicationsWithStats);
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
          finalStatus === "Опубликована в конкурсе" ? false : null,

        rejection_notification_sent:
          finalStatus === "Отклонена" ? false : null,
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
            src={application.photo_1 || application.photo}
            alt={application.name}
          />

          <h2>👑 {application.name}</h2>

          <p>🆔 Код: {application.contestant_code || "не указан"}</p>
          <p>🎂 Возраст: {application.age}</p>
          <p>
            🌍 {application.country}, {application.city}
          </p>
          <p>📏 Рост: {application.height || "не указан"}</p>
          <p>
            💍 Семейное положение:{" "}
            {application.marital_status || "не указано"}
          </p>

          <p>🟡 Статус: {application.status}</p>

          <hr />

          <p>⭐ Голосов: {application.realVotes}</p>
          <p>🎁 Подарков: {application.realGifts}</p>
          <p>💎 Получено Stars: {application.giftStars}</p>
          <p>👀 Просмотров карточки: {application.views || 0}</p>
          <p>🔗 Переходов по ссылке: {application.link_clicks || 0}</p>

          <hr />

          <h3>📝 Анкета участницы</h3>

          <p>1. Кратко о себе: {application.about_short || "не указано"}</p>
          <p>2. Чем занимается: {application.occupation || "не указано"}</p>
          <p>3. Хобби: {application.hobbies || "не указано"}</p>
          <p>
            4. Почему участвует:{" "}
            {application.participation_reason || "не указано"}
          </p>
          <p>5. Мечта: {application.dream || "не указано"}</p>
          <p>
            6. Что для неё красота:{" "}
            {application.beauty_meaning || "не указано"}
          </p>
          <p>7. Главный талант: {application.talent || "не указано"}</p>
          <p>
            8. Обращение к зрителям:{" "}
            {application.message_to_viewers || "не указано"}
          </p>
          <p>
            9. Соцсети: {application.social_link || "не указано"}
          </p>

          {application.status === "Опубликована в конкурсе" && (
            <button
              className="vote-btn"
              onClick={() => shareContestant(application)}
            >
              🔗 Поделиться карточкой
            </button>
          )}

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
  const [searchCode, setSearchCode] = useState("");

  async function loadContestants() {
    setLoading(true);
	console.time("loadContestants");
    console.log("START loadContestants");

   const { data: contestantsData, error: contestantsError } = await supabase
   .from("contestants")
   .select("id, slug, name, country, city, contestant_code, status,  created_at")
   .order("created_at", { ascending: false });

    if (contestantsError) {
      console.log(contestantsError);
      setLoading(false);
      return;
    }

   const result = (contestantsData || [])
    .filter((contestant: any) => contestant.status === "Опубликована в конкурсе")
    .map((contestant: any) => ({
        ...contestant,
       realVotes: 0,
       realGifts: 0,
      }))
      .sort((a: any, b: any) => b.realVotes - a.realVotes);

    console.log("contestantsData", contestantsData);
    console.timeEnd("loadContestants");
	
    setContestantsList(result);
    setLoading(false);
  }

  useEffect(() => {
    loadContestants();
  }, []);

  const filteredContestants = contestantsList.filter((contestant) => {
    const code = String(contestant.contestant_code || "").toLowerCase();
    const search = searchCode.toLowerCase().trim();

    if (!search) return true;

    return code.includes(search);
  });

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

      <div className="card">
        <input
          className="form-input"
          placeholder="🔍 Поиск по коду участницы"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <p>Введите код участницы, например: ВУО-123</p>
      </div>

      {filteredContestants.length === 0 && (
        <div className="card">
          <h2>Ничего не найдено</h2>
          <p>Проверьте код участницы.</p>
        </div>
      )}

      {filteredContestants.map((contestant, index) => (
        <div
          key={`${contestant.slug}-${contestant.id}`}
          className="card"
          onClick={() => navigate(`/contestant/${contestant.slug}`)}
          style={{ cursor: "pointer" }}
        >
           <div className="contestant-photo-placeholder">
           👑
           </div>

          <h2>👑 {index + 1} место — {contestant.name}</h2>

          {contestant.contestant_code && (
            <p>🆔 Код: {contestant.contestant_code}</p>
          )}

          <p>🌍 {contestant.country}, {contestant.city}</p>
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

  const [contestant, setContestant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState(0);
  const [gifts, setGifts] = useState(0);
  const [voteMessage, setVoteMessage] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  async function loadContestant() {
    if (!slug) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setContestant(data || null);
    setLoading(false);
  }

  async function loadVotes(contestantId?: number) {
    if (!contestantId) return;

    const { count, error } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("contestant_id", contestantId);

    if (error) {
      setVoteMessage(error.message);
      return;
    }

    setVotes(count || 0);
  }

  async function loadGifts(contestantId?: number) {
    if (!contestantId) return;

    const { count, error } = await supabase
      .from("gifts")
      .select("*", { count: "exact", head: true })
      .eq("contestant_id", contestantId);

    if (error) {
      setGiftMessage(error.message);
      return;
    }

    setGifts(count || 0);
  }

  useEffect(() => {
    loadContestant();
  }, [slug]);

  useEffect(() => {
    if (contestant?.id) {
      loadVotes(contestant.id);
      loadGifts(contestant.id);
    }
  }, [contestant?.id]);

  if (loading) {
    return (
      <div className="page">
        <h1>Загрузка...</h1>
      </div>
    );
  }

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

    await loadVotes(contestant.id);

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

    await loadGifts(contestant.id);

    setGiftMessage(`🎁 Спасибо! Подарок отправлен: ${giftName}`);
  }

  const photo = contestant.photo || annaPhoto;

  return (
    <div className="page">
      <h1>👑 {contestant.name}</h1>

      <img className="profile-photo" src={photo} alt={contestant.name} />

      <div className="card">
        {contestant.contestant_code && (
          <p>🆔 Код участницы: {contestant.contestant_code}</p>
        )}

        <h2>🌍 {contestant.country}</h2>
        <p>🏙️ {contestant.city}</p>
        <p>⭐ Голосов: {votes}</p>
        <p>🎁 Подарков: {gifts}</p>
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
        <p>{contestant.description || "Участница конкурса MISS TELEGRAM."}</p>
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
  const [searchCode, setSearchCode] = useState("");

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

    const contestantsWithVotes = await Promise.all(
      (data || []).map(async (contestant) => {
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

  const filteredRating = ratingList.filter((contestant) => {
    const code = String(contestant.contestant_code || "").toLowerCase();
    const search = searchCode.toLowerCase().trim();

    if (!search) return true;

    return code.includes(search);
  });

  if (loading) {
    return (
      <div className="page">
        <h1>👑 MISS TELEGRAM</h1>
        <p>Рейтинг по голосам</p>

        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>👑 MISS TELEGRAM</h1>
      <p>Рейтинг по голосам</p>

      <div className="card">
        <input
          className="form-input"
          placeholder="🔍 Поиск по коду участницы"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <p>Введите код участницы, например: ВУО-123</p>
      </div>

      {filteredRating.length === 0 && (
        <div className="card">
          <h2>Ничего не найдено</h2>
          <p>Проверьте код участницы.</p>
        </div>
      )}

      {filteredRating.map((contestant, index) => (
        <div key={contestant.id} className="card">
          <h2>{index + 1} место — {contestant.name}</h2>

          {contestant.contestant_code && (
            <p>🆔 Код: {contestant.contestant_code}</p>
          )}

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
      setBalance(balance + 100);
      setPaymentMessage("Тестовое пополнение: +100 Stars ✅");
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
          💳 Купить 100 Stars
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
  const [rating, setRating] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");

  async function loadStarRating() {
    setLoading(true);

    const { data: giftData, error: giftError } = await supabase
      .from("gifts")
      .select("contestant_id, price");

    if (giftError) {
      console.log(giftError);
      setLoading(false);
      return;
    }

    const { data: contestantData, error: contestantError } = await supabase
      .from("contestants")
      .select("id, name, country, contestant_code")
      .eq("status", "Опубликована в конкурсе");

    if (contestantError) {
      console.log(contestantError);
      setLoading(false);
      return;
    }

    const starsByContestant: any = {};

    (giftData || []).forEach((gift: any) => {
      const contestantId = gift.contestant_id;
      const price = gift.price || 0;

      starsByContestant[contestantId] =
        (starsByContestant[contestantId] || 0) + price;
    });

    const result = (contestantData || [])
      .map((contestant: any) => ({
        ...contestant,
        starPoints: starsByContestant[contestant.id] || 0,
      }))
      .sort((a: any, b: any) => b.starPoints - a.starPoints);

    setRating(result);
    setLoading(false);
  }

  useEffect(() => {
    loadStarRating();
  }, []);

  const filteredRating = rating.filter((contestant) => {
    const code = String(contestant.contestant_code || "").toLowerCase();
    const search = searchCode.toLowerCase().trim();

    if (!search) return true;

    return code.includes(search);
  });

  if (loading) {
    return (
      <div className="page">
        <h1>🎁 MISS TELEGRAM STAR</h1>
        <p>Рейтинг по подаркам</p>

        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>🎁 MISS TELEGRAM STAR</h1>
      <p>Рейтинг по подаркам</p>

      <div className="card">
        <input
          className="form-input"
          placeholder="🔍 Поиск по коду участницы"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
        />
        <p>Введите код участницы, например: ВУО-123</p>
      </div>

      {filteredRating.length === 0 && (
        <div className="card">
          <h2>Ничего не найдено</h2>
          <p>Проверьте код участницы.</p>
        </div>
      )}

      {filteredRating.map((contestant, index) => (
        <div className="card" key={contestant.id}>
          <h2>{index + 1} место — {contestant.name}</h2>

          {contestant.contestant_code && (
            <p>🆔 Код: {contestant.contestant_code}</p>
          )}

          <p>🌍 {contestant.country}</p>
          <p>💎 {contestant.starPoints} Stars</p>
        </div>
      ))}
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
import { supabase } from "./lib/supabase";
import { useState, useEffect } from "react";
import heroGirl from "./assets/hero-girl-fireworks.png";

import {
  LiveKitRoom,
  VideoTrack,
  RoomAudioRenderer,
  useLocalParticipant,
  useTracks,
} from "@livekit/components-react";

import { Track } from "livekit-client";

import "@livekit/components-styles";


import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import "./App.css";




function Home() {
  const navigate = useNavigate();

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  const isAdmin = telegramUser?.id === 678312754;
const [homeStats, setHomeStats] = useState({
    contestants: 0,
    votes: 0,
    gifts: 0,
    ambassadors: 0,
    viewers: 0,
    voteStars: 0,
    giftStars: 0,
    paidTon: 0,
});
  console.log("HOME INIT DATA:", (window as any).Telegram?.WebApp?.initDataUnsafe);
console.log("HOME START PARAM:", (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param);
console.log("HOME URL:", window.location.href);
console.log("HOME SEARCH:", window.location.search);
console.log("HOME HASH:", window.location.hash);
async function loadHomeStats() {
    const { data: contestantsData } = await supabase
    .from("contestants")
    .select("id");

    const contestantsCount = contestantsData?.length || 0;

    const { count: votesCount } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true });

    const { count: giftsCount } = await supabase
        .from("gifts")
        .select("*", { count: "exact", head: true });

    const { count: ambassadorsCount } = await supabase
        .from("ambassadors")
        .select("*", { count: "exact", head: true });


    const { count: viewersCount } = await supabase
        .from("ambassador_referrals")
        .select("*", { count: "exact", head: true })
        .eq("referral_type", "viewer");

    const { data: giftsData } = await supabase
        .from("gifts")
        .select("price");

    const giftStars = (giftsData || []).reduce(
        (sum: number, item: any) => sum + (item.price || 0),
        0
    );

    const voteStars = (votesCount || 0) * 100;

    setHomeStats({
        contestants: contestantsCount || 0,
        votes: votesCount || 0,
        gifts: giftsCount || 0,
        ambassadors: ambassadorsCount || 0,
        viewers: viewersCount || 0,
        voteStars,
        giftStars,
        paidTon: 0,
    });
}

useEffect(() => {
    loadHomeStats();
}, []);  
useEffect(() => {
  const startParam =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param;
	
	console.log("START PARAM:", startParam);
	
	console.log(
  "INIT DATA:",
  (window as any).Telegram?.WebApp?.initDataUnsafe
);

  if (!startParam || !startParam.startsWith("contestant_")) {
    return;
  }


  const contestantId = startParam.replace("contestant_", "");
  console.log("CONTESTANT ID:", contestantId);

console.log("CALL RPC WITH ID:", Number(contestantId));

supabase.rpc("increment_contestant_link_clicks", {
  p_id: Number(contestantId),
}).then((res) => {
  console.log("RPC RESULT:", res);
});

  const alreadyHandled = sessionStorage.getItem(`startapp_${startParam}`);

  if (alreadyHandled) {
    return;
  }

  sessionStorage.setItem(`startapp_${startParam}`, "1");

  navigate(`/contestant/${contestantId}`);
}, [navigate]);

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

      

{isAdmin && (
    <div className="home-wide-card" onClick={() => navigate("/ambassadors-admin")}>
        <div className="home-icon">🤝</div>
        <div>
            <h2>Амбассадоры</h2>
            <p>Панель управления амбассадорами ›</p>
        </div>
    </div>
)}

    <div className="home-wide-card" onClick={() => navigate("/contest-calendar")}>
        <div className="home-icon">📅</div>
        <div>
            <h2>Календарь конкурса</h2>
            <p>Даты сезона, этапы, финал и выплаты ›</p>
        </div>
    </div>
	
<div className="home-wide-card" onClick={() => navigate("/live")}>
    <div className="home-icon">🎥</div>
    <div>
        <h2>Прямой эфир</h2>
        <p>Смотреть трансляцию конкурса ›</p>
    </div>
</div>	

{isAdmin && (
    <div className="home-wide-card" onClick={() => navigate("/live-admin")}>
        <div className="home-icon">🎥</div>
        <div>
            <h2>Прямые эфиры</h2>
            <p>Управление трансляциями ›</p>
        </div>
    </div>
)}

      <h2 className="home-section-title">Конкурс в цифрах</h2>

      <div className="home-stats">
    <div>
        <div>👑</div>
        <strong>{homeStats.contestants}</strong>
        <span>Участниц</span>
    </div>

    <div>
        <div>⭐</div>
        <strong>{homeStats.votes}</strong>
        <span>Голосов</span>
    </div>

    <div>
        <div>🎁</div>
        <strong>{homeStats.gifts}</strong>
        <span>Подарков</span>
    </div>

    <div>
        <div>🤝</div>
        <strong>{homeStats.ambassadors}</strong>
        <span>Амбассадоров</span>
    </div>

    <div>
        <div>👥</div>
        <strong>{homeStats.viewers}</strong>
        <span>Зрителей</span>
    </div>

    <div>
        <div>💰</div>
        <strong>{homeStats.voteStars}</strong>
        <span>Stars за голоса</span>
    </div>

    <div>
        <div>💎</div>
        <strong>{homeStats.giftStars}</strong>
        <span>Stars за подарки</span>
    </div>

    <div>
        <div>🪙</div>
        <strong>{homeStats.paidTon}</strong>
        <span>Выплат TON</span>
    </div>
</div>
    </div>
  );
}

function Admin() {
  const navigate = useNavigate();
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
	<button
    className="vote-btn"
    onClick={() => navigate(-1)}
>
    ← Назад
</button>
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
  const [photo2, setPhoto2] = useState("");
  const [photo3, setPhoto3] = useState("");
  const [photo4, setPhoto4] = useState("");
  const [photo5, setPhoto5] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
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

async function uploadPhoto(
  event: React.ChangeEvent<HTMLInputElement>,
  setPhotoFunction: React.Dispatch<React.SetStateAction<string>>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  if (!telegramUser?.id) {
    setMessage("Откройте приложение через Telegram");
    return;
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${telegramUser.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("contestant-photos")
    .upload(fileName, file);

  if (uploadError) {
    console.log(uploadError);
    setMessage(uploadError.message || "Ошибка загрузки фото");
    return;
  }

  const { data } = supabase.storage
    .from("contestant-photos")
    .getPublicUrl(fileName);

  setPhotoFunction(data.publicUrl);
}

async function uploadVideo(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const file = event.target.files?.[0];

  if (!file) return;

  const telegramUser =
    (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  if (!telegramUser?.id) {
    setMessage("Откройте приложение через Telegram");
    return;
  }

  const fileExt = file.name.split(".").pop();

  const fileName =
    `${telegramUser.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("contestant-videos")
    .upload(fileName, file);

  if (uploadError) {
    console.log(uploadError);
    setMessage(uploadError.message || "Ошибка загрузки видео");
    return;
  }

  const { data } = supabase.storage
    .from("contestant-videos")
    .getPublicUrl(fileName);

  setVideoUrl(data.publicUrl);
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
  !photo ||
  !photo2 ||
  !photo3 ||
  !photo4 ||
  !photo5 ||
  !videoUrl
) {
  setMessage("Заполните все обязательные поля: 5 фото, и видео");
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
    const telegram = (window as any).Telegram?.WebApp;
const urlParams = new URLSearchParams(window.location.search);
const urlRef = urlParams.get("ref") || "";
const savedRef = localStorage.getItem("ambassadorRef") || "";

const startParam =
  telegram?.initDataUnsafe?.start_param ||
  urlRef ||
  savedRef;

const ambassadorCode =
  startParam.startsWith("amb_") ? startParam.replace("amb_", "") : null;

    const { error } = await supabase.from("contestants").insert({
      slug,
      name,
      age: Number(age),
      country,
      city,
      description,

      photo,
      photo_1: photo,
      photo_2: photo2 || null,
      photo_3: photo3 || null,
      photo_4: photo4 || null,
      photo_5: photo5 || null,
      photo_url: photo,
	  video_url: videoUrl || null,

      status: "На модерации",
      votes: 0,
      contestant_code: contestantCode,
	  ambassador_code: ambassadorCode,

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
	setPhoto2("");
    setPhoto3("");
    setPhoto4("");
    setPhoto5("");
	setVideoUrl("");
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
    onChange={(e) => uploadPhoto(e, setPhoto)}
  />

  <p>📸 Фото №2 — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={(e) => uploadPhoto(e, setPhoto2)}
  />

  <p>📸 Фото №3 — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={(e) => uploadPhoto(e, setPhoto3)}
  />

  <p>📸 Фото №4 — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={(e) => uploadPhoto(e, setPhoto4)}
  />

  <p>📸 Фото №5 — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="image/*"
    onChange={(e) => uploadPhoto(e, setPhoto5)}
  />

  {photo && (
    <img className="profile-photo" src={photo} alt="Фото заявки" />
  )}
</div>

<div className="card">
  <h2>Видео-кружочек</h2>

  <p>🎥 Видео — обязательно</p>
  <input
    className="form-input"
    type="file"
    accept="video/*"
    onChange={uploadVideo}
  />

  {videoUrl && (
    <video className="profile-photo" src={videoUrl} controls />
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
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("user");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingApplication, setEditingApplication] = useState<any>(null);
  const [editRequests, setEditRequests] = useState<any[]>([]);
  const [mediaById, setMediaById] = useState<any>({});
  const [loadingMediaId, setLoadingMediaId] = useState<number | null>(null);

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

  function startEditApplication(application: any) {
    setEditingApplication({
      ...application,
      edit_name: application.name || "",
      edit_age: application.age || "",
      edit_country: application.country || "",
      edit_city: application.city || "",
      edit_height: application.height || "",
      edit_marital_status: application.marital_status || "",
      edit_about_short: application.about_short || "",
      edit_occupation: application.occupation || "",
      edit_hobbies: application.hobbies || "",
      edit_participation_reason: application.participation_reason || "",
      edit_dream: application.dream || "",
      edit_beauty_meaning: application.beauty_meaning || "",
      edit_talent: application.talent || "",
      edit_message_to_viewers: application.message_to_viewers || "",
      edit_social_link: application.social_link || "",
      edit_photo: application.photo || application.photo_url || "",
      edit_photo_1: application.photo_1 || application.photo_url || "",
      edit_photo_2: application.photo_2 || "",
      edit_photo_3: application.photo_3 || "",
      edit_photo_4: application.photo_4 || "",
      edit_photo_5: application.photo_5 || "",
      edit_photo_url: application.photo_url || "",
      edit_video_url: application.video_url || "",
    });

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  }

  function updateEditField(field: string, value: any) {
    setEditingApplication((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function uploadEditPhoto(
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setErrorMessage("Откройте приложение через Telegram");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${telegramUser.id}-edit-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("contestant-photos")
      .upload(fileName, file);

    if (uploadError) {
      setErrorMessage(uploadError.message || "Ошибка загрузки фото");
      return;
    }

    const { data } = supabase.storage
      .from("contestant-photos")
      .getPublicUrl(fileName);

    updateEditField(field, data.publicUrl);

    if (field === "edit_photo_1") {
      updateEditField("edit_photo", data.publicUrl);
      updateEditField("edit_photo_url", data.publicUrl);
    }
  }

  async function uploadEditVideo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setErrorMessage("Откройте приложение через Telegram");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${telegramUser.id}-edit-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("contestant-videos")
      .upload(fileName, file, {
        contentType: file.type || "video/mp4",
        upsert: true,
      });

    if (uploadError) {
      setErrorMessage(uploadError.message || "Ошибка загрузки видео");
      return;
    }

    const { data } = supabase.storage
      .from("contestant-videos")
      .getPublicUrl(fileName);

    updateEditField("edit_video_url", data.publicUrl);
  }

  async function submitEditApplication() {
    if (!editingApplication) return;

    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setErrorMessage("Откройте приложение через Telegram");
      return;
    }

    const hasChanges =
      editingApplication.edit_name !== editingApplication.name ||
      Number(editingApplication.edit_age) !== Number(editingApplication.age) ||
      editingApplication.edit_country !== editingApplication.country ||
      editingApplication.edit_city !== editingApplication.city ||
      editingApplication.edit_height !== editingApplication.height ||
      editingApplication.edit_marital_status !== editingApplication.marital_status ||
      editingApplication.edit_about_short !== editingApplication.about_short ||
      editingApplication.edit_occupation !== editingApplication.occupation ||
      editingApplication.edit_hobbies !== editingApplication.hobbies ||
      editingApplication.edit_participation_reason !== editingApplication.participation_reason ||
      editingApplication.edit_dream !== editingApplication.dream ||
      editingApplication.edit_beauty_meaning !== editingApplication.beauty_meaning ||
      editingApplication.edit_talent !== editingApplication.talent ||
      editingApplication.edit_message_to_viewers !== editingApplication.message_to_viewers ||
      editingApplication.edit_social_link !== editingApplication.social_link ||
      editingApplication.edit_photo_1 !== (editingApplication.photo_1 || editingApplication.photo_url) ||
      editingApplication.edit_photo_2 !== editingApplication.photo_2 ||
      editingApplication.edit_photo_3 !== editingApplication.photo_3 ||
      editingApplication.edit_photo_4 !== editingApplication.photo_4 ||
      editingApplication.edit_photo_5 !== editingApplication.photo_5 ||
      editingApplication.edit_video_url !== editingApplication.video_url;

    if (!hasChanges) {
      setErrorMessage("Сначала измените хотя бы одно поле, фото или видео");
      return;
    }

    const description = `
Кратко о себе: ${editingApplication.edit_about_short}

Чем занимается: ${editingApplication.edit_occupation}

Хобби: ${editingApplication.edit_hobbies}

Почему участвует: ${editingApplication.edit_participation_reason}

Мечта: ${editingApplication.edit_dream}

Что для неё красота: ${editingApplication.edit_beauty_meaning}

Главный талант: ${editingApplication.edit_talent}

Обращение к зрителям: ${editingApplication.edit_message_to_viewers}

Соцсети: ${editingApplication.edit_social_link}
`;

    const { error } = await supabase.from("contestant_edits").insert({
      contestant_id: editingApplication.id,
      status: "На модерации",
      name: editingApplication.edit_name,
      age: Number(editingApplication.edit_age),
      country: editingApplication.edit_country,
      city: editingApplication.edit_city,
      description,
      photo: editingApplication.edit_photo_1,
      photo_1: editingApplication.edit_photo_1,
      photo_2: editingApplication.edit_photo_2,
      photo_3: editingApplication.edit_photo_3,
      photo_4: editingApplication.edit_photo_4,
      photo_5: editingApplication.edit_photo_5,
      photo_url: editingApplication.edit_photo_1,
      video_url: editingApplication.edit_video_url,
      height: editingApplication.edit_height,
      marital_status: editingApplication.edit_marital_status,
      about_short: editingApplication.edit_about_short,
      occupation: editingApplication.edit_occupation,
      hobbies: editingApplication.edit_hobbies,
      participation_reason: editingApplication.edit_participation_reason,
      dream: editingApplication.edit_dream,
      beauty_meaning: editingApplication.edit_beauty_meaning,
      talent: editingApplication.edit_talent,
      message_to_viewers: editingApplication.edit_message_to_viewers,
      social_link: editingApplication.edit_social_link,
      telegram_id: telegramUser.id,
      telegram_username: telegramUser.username || null,
      telegram_first_name: telegramUser.first_name || null,
      telegram_last_name: telegramUser.last_name || null,
      notification_sent: false,
    });

    if (error) {
      console.log(error);
      setErrorMessage(error.message || "Ошибка отправки изменений");
      return;
    }

    setEditingApplication(null);
    setErrorMessage("");

setApplications((prev) =>
  prev.map((application) =>
    application.id === editingApplication.id
      ? {
          ...application,
          pendingEdit: true,
        }
      : application
  )
);
  }
async function loadApplicationMedia(applicationId: number) {
  setLoadingMediaId(applicationId);

  const { data, error } = await supabase
    .from("contestants")
    .select(`
      id,
      photo,
      photo_url,
      photo_1,
      photo_2,
      photo_3,
      photo_4,
      photo_5,
      video_url
    `)
    .eq("id", applicationId)
    .single();

  if (error) {
    setErrorMessage(error.message || "Ошибка загрузки фото и видео");
    setLoadingMediaId(null);
    return;
  }

  setMediaById((prev: any) => ({
    ...prev,
    [applicationId]: data,
  }));

  setLoadingMediaId(null);
}
  function shareContestant(application: any) {
    const link = `https://t.me/MissTelegramOfficialBot?startapp=contestant_${application.id}`;

    const text = `👑 Поддержите меня в международном конкурсе красоты MISS TELEGRAM!

🆔 Мой номер участницы: ${application.contestant_code || "не указан"}

Буду благодарна за ваш голос и поддержку ❤️

⭐ Голосовать и отправлять подарки можно по ссылке:
${link}`;

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      link
    )}&text=${encodeURIComponent(text)}`;

    supabase.rpc("increment_contestant_link_clicks", {
      p_id: application.id,
    });

    window.open(shareUrl, "_blank");
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
    setErrorMessage("");

    const telegramUser = getTelegramUser();
    const role = await loadRole();

    if (!telegramUser?.id && role !== "admin") {
      setApplications([]);
      setEditRequests([]);
      setErrorMessage("Откройте раздел через Telegram Mini App");
      setLoading(false);
      return;
    }

    let query = supabase
      .from("contestants")
      .select(`
        id,
        name,
        age,
        country,
        city,
        status,
        contestant_code,
        height,
        marital_status,
        about_short,
        occupation,
        hobbies,
        participation_reason,
        dream,
        beauty_meaning,
        talent,
        message_to_viewers,
        social_link,
        views,
        link_clicks,
        telegram_id,
        moderated_by,
        moderated_by_name,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (role !== "admin" && role !== "moderator") {
      query = query.eq("telegram_id", telegramUser.id).neq("status", "Отклонена");
    }

    const { data, error } = await query;

    if (error) {
      console.log("CONTESTANTS QUERY ERROR:", error);
      setErrorMessage(error.message || "Ошибка загрузки заявок");
      setApplications([]);
      setEditRequests([]);
      setLoading(false);
      return;
    }

    const applicationIds = (data || []).map((application: any) => application.id);

    const { data: pendingEditsData } = await supabase
      .from("contestant_edits")
      .select("contestant_id")
      .eq("status", "На модерации")
      .in("contestant_id", applicationIds);

    const pendingEditByContestant: any = {};

    (pendingEditsData || []).forEach((edit: any) => {
      pendingEditByContestant[edit.contestant_id] = true;
    });

    if (role === "admin" || role === "moderator") {
     const { data: editRequestsData, error: editRequestsError } = await supabase
  .from("contestant_edits")
  .select(`
  
  id,
  contestant_id,
  status,
  name,
  age,
  country,
  city,
  height,
  marital_status,
  about_short,
  occupation,
  hobbies,
  participation_reason,
  dream,
  beauty_meaning,
  talent,
  message_to_viewers,
  social_link,
  created_at
`)
        .eq("status", "На модерации")
        .order("created_at", { ascending: false });

      if (editRequestsError) {
        console.log("EDIT REQUESTS ERROR:", editRequestsError);
        setEditRequests([]);
      } else {
        setEditRequests(editRequestsData || []);
      }
    } else {
      setEditRequests([]);
    }

    const { data: votesData } = await supabase
      .from("votes")
      .select("contestant_id")
      .in("contestant_id", applicationIds);

    const { data: giftsData } = await supabase
      .from("gifts")
      .select("contestant_id, price")
      .in("contestant_id", applicationIds);

    const votesByContestant: any = {};
    const giftsByContestant: any = {};
    const giftStarsByContestant: any = {};

    (votesData || []).forEach((vote: any) => {
      votesByContestant[vote.contestant_id] =
        (votesByContestant[vote.contestant_id] || 0) + 1;
    });

    (giftsData || []).forEach((gift: any) => {
      giftsByContestant[gift.contestant_id] =
        (giftsByContestant[gift.contestant_id] || 0) + 1;

      giftStarsByContestant[gift.contestant_id] =
        (giftStarsByContestant[gift.contestant_id] || 0) + (gift.price || 0);
    });

    const applicationsWithStats = (data || []).map((application: any) => ({
      ...application,
      pendingEdit: pendingEditByContestant[application.id] || false,
      realVotes: votesByContestant[application.id] || 0,
      realGifts: giftsByContestant[application.id] || 0,
      giftStars: giftStarsByContestant[application.id] || 0,
      votePlace: null,
      giftPlace: null,
    }));

    setApplications(applicationsWithStats);
    setLoading(false);
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function approveEdit(edit: any) {
    const telegramUser = getTelegramUser();
    const { data: approvedEditData, error: editError } = await supabase
  .from("contestant_edits")
  .update({
  status: "Одобрена",
  moderated_by: telegramUser?.id,
  moderated_by_name: getTelegramName(telegramUser),
})
  .eq("id", edit.id)
  .eq("status", "На модерации")
  .select("id");

    if (editError) {
      setErrorMessage(editError.message || "Ошибка обновления редактирования");
      return;
    }
if (!approvedEditData || approvedEditData.length === 0) {
  setErrorMessage("Эта заявка уже обработана другим модератором");
  setEditRequests((prev) =>
    prev.filter((item) => item.id !== edit.id)
  );
  return;
}

const { error: updateError } = await supabase
  .from("contestants")
  .update({
    status: "Опубликована в конкурсе",
    name: edit.name,
    age: edit.age,
    country: edit.country,
    city: edit.city,
    photo: edit.photo || edit.photo_url,
    photo_1: edit.photo_1 || edit.photo_url,
    photo_2: edit.photo_2,
    photo_3: edit.photo_3,
    photo_4: edit.photo_4,
    photo_5: edit.photo_5,
    photo_url: edit.photo_url || edit.photo_1 || edit.photo,
    video_url: edit.video_url,
    height: edit.height,
    marital_status: edit.marital_status,
    about_short: edit.about_short,
    occupation: edit.occupation,
    hobbies: edit.hobbies,
    participation_reason: edit.participation_reason,
    dream: edit.dream,
    beauty_meaning: edit.beauty_meaning,
    talent: edit.talent,
    message_to_viewers: edit.message_to_viewers,
    social_link: edit.social_link,
  })
  .eq("id", edit.contestant_id);

if (updateError) {
  setErrorMessage(updateError.message || "Ошибка одобрения изменений");
  return;
}

    setEditRequests((prev) => prev.filter((item) => item.id !== edit.id));

setApplications((prev) =>
  prev.map((application) =>
    application.id === edit.contestant_id
      ? {
          ...application,
          ...edit,
          status: "Опубликована в конкурсе",
          pendingEdit: false,
        }
      : application
  )
);
  }

  async function rejectEdit(editId: number) {
    const telegramUser = getTelegramUser();
    const { data: rejectedEditData, error } = await supabase
      .from("contestant_edits")
      .update({
	    status: "Отклонена",
		moderated_by: telegramUser?.id,
		moderated_by_name: getTelegramName(telegramUser),
	})	
      .eq("id", editId)
	  .eq("status", "На модерации")
	  .select("id");

    if (error) {
      setErrorMessage(error.message || "Ошибка отклонения изменений");
      return;
    }
	
	if (!rejectedEditData || rejectedEditData.length === 0) {
	 setErrorMessage("Эта заявка уже обработана другим модератором");
	 setEditRequests((prev) => prev.filter((item) => item.id !== editId));
	 return;
	}

    await loadApplications();
  }

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
      setErrorMessage(error.message || "Ошибка изменения статуса");
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

  if (errorMessage) {
    return (
      <div className="page">
	  
        <h1>📋 Заявки</h1>
        <div className="card">
          <h2>Ошибка</h2>
          <p>{errorMessage}</p>
        </div>

        <button className="vote-btn" onClick={() => setErrorMessage("")}>
          Закрыть ошибку
        </button>
      </div>
    );
  }

  if (editingApplication) {
    return (
      <div className="page">
        <h1>✏️ Редактировать заявку</h1>

        <div className="card">
          <input className="form-input" placeholder="Имя" value={editingApplication.edit_name} onChange={(e) => updateEditField("edit_name", e.target.value)} />
          <input className="form-input" placeholder="Возраст" value={editingApplication.edit_age} onChange={(e) => updateEditField("edit_age", e.target.value)} />
          <input className="form-input" placeholder="Страна" value={editingApplication.edit_country} onChange={(e) => updateEditField("edit_country", e.target.value)} />
          <input className="form-input" placeholder="Город" value={editingApplication.edit_city} onChange={(e) => updateEditField("edit_city", e.target.value)} />
          <input className="form-input" placeholder="Рост" value={editingApplication.edit_height} onChange={(e) => updateEditField("edit_height", e.target.value)} />
          <input className="form-input" placeholder="Семейное положение" value={editingApplication.edit_marital_status} onChange={(e) => updateEditField("edit_marital_status", e.target.value)} />
        </div>

        <div className="card">
          <textarea className="form-input" placeholder="1. Кратко о себе" value={editingApplication.edit_about_short} onChange={(e) => updateEditField("edit_about_short", e.target.value)} />
          <textarea className="form-input" placeholder="2. Чем занимается" value={editingApplication.edit_occupation} onChange={(e) => updateEditField("edit_occupation", e.target.value)} />
          <textarea className="form-input" placeholder="3. Хобби" value={editingApplication.edit_hobbies} onChange={(e) => updateEditField("edit_hobbies", e.target.value)} />
          <textarea className="form-input" placeholder="4. Почему участвует" value={editingApplication.edit_participation_reason} onChange={(e) => updateEditField("edit_participation_reason", e.target.value)} />
          <textarea className="form-input" placeholder="5. Мечта" value={editingApplication.edit_dream} onChange={(e) => updateEditField("edit_dream", e.target.value)} />
          <textarea className="form-input" placeholder="6. Что для неё красота" value={editingApplication.edit_beauty_meaning} onChange={(e) => updateEditField("edit_beauty_meaning", e.target.value)} />
          <textarea className="form-input" placeholder="7. Главный талант" value={editingApplication.edit_talent} onChange={(e) => updateEditField("edit_talent", e.target.value)} />
          <textarea className="form-input" placeholder="8. Обращение к зрителям" value={editingApplication.edit_message_to_viewers} onChange={(e) => updateEditField("edit_message_to_viewers", e.target.value)} />
          <input className="form-input" placeholder="9. Instagram / Telegram / TikTok" value={editingApplication.edit_social_link} onChange={(e) => updateEditField("edit_social_link", e.target.value)} />
        </div>

        <div className="card">
          <h2>Фото</h2>
          <p>Фото №1</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_1")} />
          <p>Фото №2</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_2")} />
          <p>Фото №3</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_3")} />
          <p>Фото №4</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_4")} />
          <p>Фото №5</p>
          <input className="form-input" type="file" accept="image/*" onChange={(e) => uploadEditPhoto(e, "edit_photo_5")} />
        </div>

        <div className="card">
          <h2>Видео</h2>
          <input className="form-input" type="file" accept="video/*" onChange={uploadEditVideo} />

          {editingApplication.edit_video_url && (
            <video className="profile-photo" controls playsInline>
              <source src={editingApplication.edit_video_url} type="video/mp4" />
            </video>
          )}
        </div>

        <div className="card">
          <button className="vote-btn" onClick={submitEditApplication}>
            🕒 Отправить изменения на модерацию
          </button>

          <button className="gift-btn" onClick={() => setEditingApplication(null)}>
            Отмена
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
	<button
    className="vote-btn"
    onClick={() => navigate(-1)}
>
    ← Назад
</button>
      <h1>📋 Заявки</h1>
	  
	<div className="card">
    <h2>🎥 Прямые эфиры</h2>

    <p>
        Подайте заявку на участие
        в LIVE-трансляции
        MISS TELEGRAM.
    </p>

    <button
        className="vote-btn"
        onClick={() => navigate("/live-application")}
    >
        🎥 Подать заявку
    </button>
</div>  

      {(userRole === "admin" || userRole === "moderator") &&
        editRequests.length > 0 && (
          <div className="card">
            <h2>✏️ Редактирования на модерации</h2>

            {editRequests.map((edit) => (
              <div key={edit.id} className="card">
                <h3>Заявка #{edit.contestant_id}</h3>
                <p>👑 Имя: {edit.name}</p>
                <p>🎂 Возраст: {edit.age || "не указан"}</p>
                <p>🌍 {edit.country || "не указано"}, {edit.city || "не указано"}</p>
                <p>📏 Рост: {edit.height || "не указан"}</p>
                <p>💍 Семейное положение: {edit.marital_status || "не указано"}</p>
                <p>🟡 Статус: {edit.status}</p>

                {[
                  edit.photo_1 || edit.photo_url,
                  edit.photo_2,
                  edit.photo_3,
                  edit.photo_4,
                  edit.photo_5,
                ]
                  .filter(Boolean)
                  .map((photoUrl, index) => (
                    <img
                      key={index}
                      className="profile-photo"
                      src={photoUrl}
                      alt={edit.name}
                    />
                  ))}

                {edit.video_url && (
                  <video className="profile-photo" controls playsInline>
                    <source src={edit.video_url} type="video/mp4" />
                  </video>
                )}

                <p>📝 Кратко о себе: {edit.about_short || "не указано"}</p>
                <p>💼 Чем занимается: {edit.occupation || "не указано"}</p>
                <p>🎯 Хобби: {edit.hobbies || "не указано"}</p>
                <p>❓ Почему участвует: {edit.participation_reason || "не указано"}</p>
                <p>💭 Мечта: {edit.dream || "не указано"}</p>
                <p>💎 Что для неё красота: {edit.beauty_meaning || "не указано"}</p>
                <p>⭐ Главный талант: {edit.talent || "не указано"}</p>
                <p>💌 Обращение к зрителям: {edit.message_to_viewers || "не указано"}</p>
                <p>🔗 Соцсеть: {edit.social_link || "не указано"}</p>

                <button className="vote-btn" onClick={() => approveEdit(edit)}>
                  🟢 Одобрить изменения
                </button>

                <button className="gift-btn" onClick={() => rejectEdit(edit.id)}>
                  🔴 Отклонить изменения
                </button>
              </div>
            ))}
          </div>
        )}

      {applications.length === 0 && (
        <div className="card">
          <h2>Заявок пока нет</h2>
          <p>
            {userRole === "admin" || userRole === "moderator"
              ? "Новых заявок на модерацию нет."
              : "У вас пока нет заявок."}
          </p>
        </div>
      )}

      {editRequests.length === 0 &&
  applications.map((application) => (
        <div className="card" key={application.id}>
		{!mediaById[application.id] && (
  <button
    className="vote-btn"
    onClick={() => loadApplicationMedia(application.id)}
  >
    📸 Показать фото/видео
  </button>
)}

{loadingMediaId === application.id && (
  <p>Загрузка фото/видео...</p>
)}

{mediaById[application.id] &&
  [
    mediaById[application.id].photo_1 || mediaById[application.id].photo_url,
    mediaById[application.id].photo_2,
    mediaById[application.id].photo_3,
    mediaById[application.id].photo_4,
    mediaById[application.id].photo_5,
  ]
    .filter(Boolean)
    .map((photoUrl, index) => (
      <img
        key={index}
        className="profile-photo"
        src={photoUrl}
        alt={application.name}
      />
    ))}

{mediaById[application.id]?.video_url && (
  <video className="profile-photo" controls playsInline>
    <source src={mediaById[application.id].video_url} type="video/mp4" />
  </video>
)}
          {[
            application.photo_1 || application.photo_url,
            application.photo_2,
            application.photo_3,
            application.photo_4,
            application.photo_5,
          ]
            .filter(Boolean)
            .map((photoUrl, index) => (
              <img
                key={index}
                className="profile-photo"
                src={photoUrl}
                alt={application.name}
              />
            ))}

          {application.video_url && (
            <video className="profile-photo" controls playsInline>
              <source src={application.video_url} type="video/mp4" />
            </video>
          )}

          <h2>👑 {application.name}</h2>
          <p>🆔 Код: {application.contestant_code || "не указан"}</p>
          <p>🎂 Возраст: {application.age || "не указан"}</p>
          <p>🌍 {application.country}, {application.city}</p>
          <p>📏 Рост: {application.height || "не указан"}</p>
          <p>💍 Семейное положение: {application.marital_status || "не указано"}</p>
          <p>🟡 Статус: {application.status}</p>

          {application.pendingEdit && (
            <p className="success-message">
              🕒 Изменения отправлены на модерацию
            </p>
          )}

          <hr />

          <p>⭐ Голосов: {application.realVotes}</p>
          <p>🎁 Подарков: {application.realGifts}</p>
          <p>💎 Получено Stars: {application.giftStars}</p>
          <p>🏆 Место по голосам: {application.votePlace || "после публикации"}</p>
          <p>🏆 Место по подаркам: {application.giftPlace || "после публикации"}</p>
          <p>👀 Просмотров карточки: {application.views || 0}</p>
          <p>🔗 Переходов по ссылке: {application.link_clicks || 0}</p>

          <hr />

          <h3>📝 Анкета участницы</h3>
          <p>1. Кратко о себе: {application.about_short || "не указано"}</p>
          <p>2. Чем занимается: {application.occupation || "не указано"}</p>
          <p>3. Хобби: {application.hobbies || "не указано"}</p>
          <p>4. Почему участвует: {application.participation_reason || "не указано"}</p>
          <p>5. Мечта: {application.dream || "не указано"}</p>
          <p>6. Что для неё красота: {application.beauty_meaning || "не указано"}</p>
          <p>7. Главный талант: {application.talent || "не указано"}</p>
          <p>8. Обращение к зрителям: {application.message_to_viewers || "не указано"}</p>
          <p>9. Соцсети: {application.social_link || "не указано"}</p>

          {application.status === "Опубликована в конкурсе" &&
            !application.pendingEdit && (
              <button
                className="vote-btn"
                onClick={() => startEditApplication(application)}
              >
                ✏️ Редактировать заявку
              </button>
            )}

          {application.status === "Опубликована в конкурсе" && (
            <button className="vote-btn" onClick={() => shareContestant(application)}>
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

    const { data: contestantsData, error: contestantsError } = await supabase
      .from("contestants")
      .select(
  "id, slug, name, country, city, contestant_code, status, created_at, photo_url, video_url"
)
      .order("created_at", { ascending: false });

    if (contestantsError) {
      console.log(contestantsError);
      setLoading(false);
      return;
    }

    const { data: votesData, error: votesError } = await supabase
      .from("votes")
      .select("contestant_id");

    if (votesError) {
      console.log(votesError);
      setLoading(false);
      return;
    }

    const { data: giftsData, error: giftsError } = await supabase
      .from("gifts")
      .select("contestant_id, price");

    if (giftsError) {
      console.log(giftsError);
      setLoading(false);
      return;
    }

    const votesByContestant: any = {};
    const giftsByContestant: any = {};
    const giftStarsByContestant: any = {};

    (votesData || []).forEach((vote: any) => {
      votesByContestant[vote.contestant_id] =
        (votesByContestant[vote.contestant_id] || 0) + 1;
    });

    (giftsData || []).forEach((gift: any) => {
      giftsByContestant[gift.contestant_id] =
        (giftsByContestant[gift.contestant_id] || 0) + 1;

      giftStarsByContestant[gift.contestant_id] =
        (giftStarsByContestant[gift.contestant_id] || 0) + (gift.price || 0);
    });

    const result = (contestantsData || [])
      .filter(
        (contestant: any) =>
          contestant.status === "Опубликована в конкурсе"
      )
      .map((contestant: any) => ({
        ...contestant,
        realVotes: votesByContestant[contestant.id] || 0,
        realGifts: giftsByContestant[contestant.id] || 0,
        giftStars: giftStarsByContestant[contestant.id] || 0,
      }))
      .sort((a: any, b: any) => {
        if (b.realVotes !== a.realVotes) {
          return b.realVotes - a.realVotes;
        }

        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
        })
  .map((contestant: any, index: number) => ({
    ...contestant,
    place: index + 1,
  }));

    const giftRanking = [...result].sort((a: any, b: any) => {
      if (b.giftStars !== a.giftStars) {
        return b.giftStars - a.giftStars;
      }

      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
    });

    const giftPlaceByContestant: any = {};

    giftRanking.forEach((contestant: any, index: number) => {
      giftPlaceByContestant[contestant.id] = index + 1;
    });

    const finalResult = result.map((contestant: any) => ({
      ...contestant,
      giftPlace: giftPlaceByContestant[contestant.id] || null,
    }));

    setContestantsList(finalResult);
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
	<button
    className="vote-btn"
    onClick={() => navigate(-1)}
>
    ← Назад
</button>
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

      {filteredContestants.map((contestant) => (
        <div
          key={`${contestant.slug}-${contestant.id}`}
          className="card"
          onClick={() => navigate(`/contestant/${contestant.slug}`)}
          style={{ cursor: "pointer" }}
        >
          {contestant.photo_url ? (
            <img
              className="contestant-photo"
              src={contestant.photo_url}
              alt={contestant.name}
            />
          ) : (
            <div className="contestant-photo-placeholder">👑</div>
          )}

{contestant.video_url && (
  <video className="profile-photo" controls playsInline>
    <source src={contestant.video_url} type="video/mp4" />
  </video>
)}

          <h2>👑 {contestant.place} место — {contestant.name}</h2>

          <p>🆔 Код: {contestant.contestant_code || "не указан"}</p>
          <p>🌍 Страна: {contestant.country || "не указана"}</p>
          <p>🏙️ Город: {contestant.city || "не указан"}</p>
          <p>⭐ Голосов: {contestant.realVotes}</p>
          <p>🎁 Подарков: {contestant.realGifts}</p>
          <p>💎 Получено Stars: {contestant.giftStars}</p>
          <p>🏆 Место по подаркам: {contestant.giftPlace || "нет"}</p>
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
  const navigate = useNavigate();

  const [contestant, setContestant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState(0);
  const [gifts, setGifts] = useState(0);
  const [giftStars, setGiftStars] = useState(0);
  const [votePlace, setVotePlace] = useState<any>(null);
  const [giftPlace, setGiftPlace] = useState<any>(null);
  const [voteMessage, setVoteMessage] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  async function loadContestant() {
    if (!slug) {
      setLoading(false);
      return;
    }

    let query = supabase.from("contestants").select("*");

    if (/^\d+$/.test(String(slug))) {
      query = query.eq("id", Number(slug));
    } else {
      query = query.eq("slug", slug);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    if (data?.id) {
      await supabase.rpc("increment_contestant_views", {
        p_id: Number(data.id),
      });

      setContestant({
        ...data,
        views: (data.views || 0) + 1,
      });
    } else {
      setContestant(null);
    }

    setLoading(false);
  }

  async function loadStats(contestantId: number) {
    const { data: votesData } = await supabase
      .from("votes")
      .select("contestant_id");

    const { data: giftsData } = await supabase
      .from("gifts")
      .select("contestant_id, price");

    const { data: contestantsData } = await supabase
      .from("contestants")
      .select("id, status, created_at")
      .eq("status", "Опубликована в конкурсе");

    const votesByContestant: any = {};
    const giftsByContestant: any = {};
    const giftStarsByContestant: any = {};

    (votesData || []).forEach((vote: any) => {
      votesByContestant[vote.contestant_id] =
        (votesByContestant[vote.contestant_id] || 0) + 1;
    });

    (giftsData || []).forEach((gift: any) => {
      giftsByContestant[gift.contestant_id] =
        (giftsByContestant[gift.contestant_id] || 0) + 1;

      giftStarsByContestant[gift.contestant_id] =
        (giftStarsByContestant[gift.contestant_id] || 0) + (gift.price || 0);
    });

    const voteRanking = (contestantsData || [])
      .map((item: any) => ({
        ...item,
        realVotes: votesByContestant[item.id] || 0,
      }))
      .sort((a: any, b: any) => {
        if (b.realVotes !== a.realVotes) {
          return b.realVotes - a.realVotes;
        }

        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      });

    const giftRanking = (contestantsData || [])
      .map((item: any) => ({
        ...item,
        giftStars: giftStarsByContestant[item.id] || 0,
      }))
      .sort((a: any, b: any) => {
        if (b.giftStars !== a.giftStars) {
          return b.giftStars - a.giftStars;
        }

        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        );
      });

    const currentVotePlace =
      voteRanking.findIndex((item: any) => item.id === contestantId) + 1;

    const currentGiftPlace =
      giftRanking.findIndex((item: any) => item.id === contestantId) + 1;

    setVotes(votesByContestant[contestantId] || 0);
    setGifts(giftsByContestant[contestantId] || 0);
    setGiftStars(giftStarsByContestant[contestantId] || 0);
    setVotePlace(currentVotePlace > 0 ? currentVotePlace : null);
    setGiftPlace(currentGiftPlace > 0 ? currentGiftPlace : null);
  }

  useEffect(() => {
    loadContestant();
  }, [slug]);

  useEffect(() => {
    if (!contestant?.id) {
      return;
    }

    loadStats(contestant.id);
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

    await loadStats(contestant.id);

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

    await loadStats(contestant.id);

    setGiftMessage(`🎁 Спасибо! Подарок отправлен: ${giftName}`);
  }

  function shareContestant() {
    const link = `https://t.me/MissTelegramOfficialBot?startapp=contestant_${contestant.id}`;

    const text = `👑 Поддержите участницу MISS TELEGRAM!

🆔 Код участницы: ${contestant.contestant_code || "не указан"}

⭐ Голосовать и отправлять подарки можно по ссылке:
${link}`;

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      link
    )}&text=${encodeURIComponent(text)}`;

    window.open(shareUrl, "_blank");
  }

const photos = Array.from(
  new Set(
    [
      contestant.photo_url,
      contestant.photo_1,
      contestant.photo_2,
      contestant.photo_3,
      contestant.photo_4,
      contestant.photo_5,
    ].filter(Boolean)
  )
);

  const createdDate = contestant.created_at
    ? new Date(contestant.created_at).toLocaleDateString("ru-RU")
    : "не указана";

  return (
    <div className="page">
	<button
    className="vote-btn"
    onClick={() => navigate(-1)}
>
    ← Назад
</button>
      <h1>👑 {contestant.name}</h1>

      <div className="card">
        
		{photos.length > 0 ? (
          <div>
            {photos.map((photoItem: string, index: number) => (
              <img
                key={`${photoItem}-${index}`}
                className="profile-photo"
                src={photoItem}
                alt={`${contestant.name} фото ${index + 1}`}
              />
            ))}
          </div>
        ) : (
          <div className="contestant-photo-placeholder">👑</div>
        )}
		
		{contestant.video_url && (
<video className="profile-photo" controls playsInline>
  <source src={contestant.video_url} type="video/mp4" />
</video>
)}
		
      </div>
      <div className="card">
        <h2>👑 {contestant.name}</h2>
        <p>🆔 Код: {contestant.contestant_code || "не указан"}</p>
        <p>📅 Дата регистрации: {createdDate}</p>
        <p>🎂 Возраст: {contestant.age || "не указан"}</p>
        <p>
          🌍 {contestant.country || "не указана"},{" "}
          {contestant.city || "не указан"}
        </p>
        <p>📏 Рост: {contestant.height || "не указан"}</p>
        <p>
          💍 Семейное положение:{" "}
          {contestant.marital_status || "не указано"}
        </p>
        <p>🟡 Статус: {contestant.status || "не указан"}</p>

        <hr />

        <p>⭐ Голосов: {votes}</p>
        <p>🎁 Подарков: {gifts}</p>
        <p>💎 Получено Stars: {giftStars}</p>
        <p>🏆 Место по голосам: {votePlace || "нет"}</p>
        <p>🏆 Место по подаркам: {giftPlace || "нет"}</p>
        <p>👀 Просмотров карточки: {contestant.views || 0}</p>
        <p>🔗 Переходов по ссылке: {contestant.link_clicks || 0}</p>

        <button className="vote-btn" onClick={shareContestant}>
          🔗 Поделиться карточкой
        </button>
      </div>

      <div className="card">
        <h2>📝 Анкета участницы</h2>
        <p>1. Кратко о себе: {contestant.about_short || "не указано"}</p>
        <p>2. Чем занимается: {contestant.occupation || "не указано"}</p>
        <p>3. Хобби: {contestant.hobbies || "не указано"}</p>
        <p>
          4. Почему участвует:{" "}
          {contestant.participation_reason || "не указано"}
        </p>
        <p>5. Мечта: {contestant.dream || "не указано"}</p>
        <p>
          6. Что для неё красота:{" "}
          {contestant.beauty_meaning || "не указано"}
        </p>
        <p>7. Главный талант: {contestant.talent || "не указано"}</p>
        <p>
          8. Обращение к зрителям:{" "}
          {contestant.message_to_viewers || "не указано"}
        </p>
        <p>9. Соцсети: {contestant.social_link || "не указано"}</p>
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
  const navigate = useNavigate();
  
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

contestantsWithVotes.sort((a: any, b: any) => {
  if (b.realVotes !== a.realVotes) {
    return b.realVotes - a.realVotes;
  }

  return (
    new Date(a.created_at).getTime() -
    new Date(b.created_at).getTime()
  );
});

const contestantsWithPlaces = contestantsWithVotes.map(
  (contestant: any, index: number) => ({
    ...contestant,
    place: index + 1,
  })
);

setRatingList(contestantsWithPlaces);
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
	<button
    className="vote-btn"
    onClick={() => navigate(-1)}
>
    ← Назад
</button>
	
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

      {filteredRating.map((contestant) => (
  <div
    key={contestant.id}
    className="card"
    onClick={() => navigate(`/contestant/${contestant.id}`)}
    style={{ cursor: "pointer" }}
  >
          <h2>{contestant.place} место — {contestant.name}</h2>

          {contestant.contestant_code && (
            <p>🆔 Код: {contestant.contestant_code}</p>
          )}

          <p>🌍 {contestant.country}</p>
          <p>⭐ {contestant.realVotes} голосов</p>
		  <p>👆 Нажмите, чтобы открыть карточку участницы</p>
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
  const navigate = useNavigate();
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
	<button
    className="vote-btn"
    onClick={() => navigate(-1)}
>
    ← Назад
</button>
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
  const navigate = useNavigate();

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
      .sort((a: any, b: any) => b.starPoints - a.starPoints)
      .map((contestant: any, index: number) => ({
        ...contestant,
        place: index + 1,
      }));

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
	<button
    className="vote-btn"
    onClick={() => navigate(-1)}
>
    ← Назад
</button>
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

      {filteredRating.map((contestant) => (
        <div
          className="card"
          key={contestant.id}
          onClick={() => navigate(`/contestant/${contestant.id}`)}
          style={{ cursor: "pointer" }}
        >
          <h2>{contestant.place} место — {contestant.name}</h2>

          {contestant.contestant_code && (
            <p>🆔 Код: {contestant.contestant_code}</p>
          )}

          <p>🌍 {contestant.country}</p>
          <p>💎 {contestant.starPoints} Stars</p>
          <p>👆 Нажмите, чтобы открыть карточку участницы</p>
        </div>
      ))}
    </div>
  );
}

function Ambassador() {
  const navigate = useNavigate();
  const ADMIN_TELEGRAM_ID = 678312754;

  const [showForm, setShowForm] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [ownAmbassador, setOwnAmbassador] = useState<any>(null);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [viewersCount, setViewersCount] = useState(0);
  const [votesCount, setVotesCount] = useState(0);
  const [giftsCount, setGiftsCount] = useState(0);
  const [myContestants, setMyContestants] = useState<any[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [publishedCount, setPublishedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingAmbassadors, setPendingAmbassadors] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    country: "",
    city: "",
    main_social_link: "",
    audience_size: "",
    invite_focus: "",
    promotion_experience: "",
    reason: "",
    agreed_rules: false,
  });

  function getTelegramUser() {
    return (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
  }

  function getTelegramName(user: any) {
    return (
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
      user?.username ||
      "Admin"
    );
  }

  function updateField(field: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function loadAmbassadorData() {
    setLoading(true);
    setErrorMessage("");

    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setLoading(false);
      return;
    }

    const { data: ownData } = await supabase
      .from("ambassadors")
      .select("*")
      .eq("telegram_id", telegramUser.id)
      .order("created_at", { ascending: false })
      .limit(1);

    setOwnAmbassador((ownData || [])[0] || null);
	const ambassador = (ownData || [])[0];
    if (!ambassador) {
      setLoading(false);
      return;
}
    if (ambassador?.referral_code) {
      const { count } = await supabase
        .from("contestants")
        .select("*", { count: "exact", head: true })
        .eq("ambassador_code", ambassador.referral_code);

  setParticipantsCount(count || 0);
  const { count: viewers } = await supabase
  .from("ambassador_referrals")
  .select("*", { count: "exact", head: true })
  .eq("ambassador_code", ambassador.referral_code);

setViewersCount(viewers || 0);
const { data: invitedContestants } = await supabase
  .from("contestants")
  .select("id")
  .eq("ambassador_code", ambassador.referral_code);

const invitedContestantIds = (invitedContestants || []).map(
  (contestant: any) => contestant.id
);

if (invitedContestantIds.length > 0) {
  const { count: votes } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .in("contestant_id", invitedContestantIds);

  setVotesCount(votes || 0);
} else {
  setVotesCount(0);
}
if (invitedContestantIds.length > 0) {
  const { data: giftsData } = await supabase
    .from("gifts")
    .select("price")
    .in("contestant_id", invitedContestantIds);

  const totalGifts = (giftsData || []).reduce(
    (sum: number, gift: any) => sum + (gift.price || 0),
    0
  );

  setGiftsCount(totalGifts);
} else {
  setGiftsCount(0);
}
}
const { data: myContestantsData } = await supabase
  .from("contestants")
  .select("id,name,contestant_code,status,votes,created_at")
  .eq("ambassador_code", ambassador.referral_code)
  .order("created_at", { ascending: false });

const contestantsWithStars = await Promise.all(
  (myContestantsData || []).map(async (contestant: any) => {
    const { data: giftsData } = await supabase
      .from("gifts")
      .select("price")
      .eq("contestant_id", contestant.id);

    const stars = (giftsData || []).reduce(
      (sum: number, gift: any) => sum + (gift.price || 0),
      0
    );

    return {
      ...contestant,
      stars,
    };
  })
);

setMyContestants(contestantsWithStars);
const totalVotes = contestantsWithStars.reduce(
  (sum: number, item: any) => sum + (item.votes || 0),
  0
);

const totalStars = contestantsWithStars.reduce(
  (sum: number, item: any) => sum + (item.stars || 0),
  0
);

const publishedCount = contestantsWithStars.filter(
  (x: any) => x.status === "Опубликована в конкурсе"
).length;

const pendingCount = contestantsWithStars.filter(
  (x: any) => x.status === "На модерации"
).length;

const rejectedCount = contestantsWithStars.filter(
  (x: any) => x.status === "Отклонена"
).length;

setTotalVotes(totalVotes);
setTotalStars(totalStars);
setPublishedCount(publishedCount);
setPendingCount(pendingCount);
setRejectedCount(rejectedCount);
    if (telegramUser.id === ADMIN_TELEGRAM_ID) {
      const { data: pendingData, error } = await supabase
        .from("ambassadors")
        .select("*")
        .eq("status", "На модерации")
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message || "Ошибка загрузки амбассадоров");
        setPendingAmbassadors([]);
      } else {
        setPendingAmbassadors(pendingData || []);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAmbassadorData();
  }, []);

  async function submitAmbassador() {
    const telegramUser = getTelegramUser();

    if (!telegramUser?.id) {
      setErrorMessage("Откройте приложение через Telegram");
      return;
    }

    if (!form.name || !form.country || !form.city || !form.main_social_link) {
      setErrorMessage("Заполните имя, страну, город и ссылку на соцсеть");
      return;
    }

    if (!form.agreed_rules) {
      setErrorMessage("Нужно согласиться с правилами участия");
      return;
    }

    const referralCode = `AMB-${telegramUser.id}`;

    const { data, error } = await supabase
      .from("ambassadors")
      .insert({
        telegram_id: telegramUser.id,
        telegram_username: telegramUser.username || null,
        telegram_first_name: telegramUser.first_name || null,
        telegram_last_name: telegramUser.last_name || null,
        name: form.name,
        country: form.country,
        city: form.city,
        main_social_link: form.main_social_link,
        audience_size: form.audience_size,
        invite_focus: form.invite_focus,
        promotion_experience: form.promotion_experience,
        reason: form.reason,
        agreed_rules: form.agreed_rules,
        status: "На модерации",
        referral_code: referralCode,
        notification_sent: false,
      })
      .select("*")
      .single();

    if (error) {
      setErrorMessage(error.message || "Ошибка отправки заявки");
      return;
    }

    setOwnAmbassador(data);
    setSent(true);
    setErrorMessage("");
  }

  async function approveAmbassador(ambassador: any) {
    const telegramUser = getTelegramUser();

    const { error } = await supabase
      .from("ambassadors")
      .update({
        status: "Одобрен",
        approved_at: new Date().toISOString(),
        approved_by: telegramUser?.id,
        approved_by_name: getTelegramName(telegramUser),
      })
      .eq("id", ambassador.id);

    if (error) {
      setErrorMessage(error.message || "Ошибка одобрения амбассадора");
      return;
    }

    await loadAmbassadorData();
  }

  async function rejectAmbassador(ambassador: any) {
    const telegramUser = getTelegramUser();

    const { error } = await supabase
      .from("ambassadors")
      .update({
        status: "Отклонён",
        rejected_at: new Date().toISOString(),
        rejected_by: telegramUser?.id,
        rejected_by_name: getTelegramName(telegramUser),
      })
      .eq("id", ambassador.id);

    if (error) {
      setErrorMessage(error.message || "Ошибка отклонения амбассадора");
      return;
    }

    await loadAmbassadorData();
  }

  if (loading) {
    return (
      <div className="page">
        <h1>🤝 Амбассадор</h1>
        <div className="card">
          <h2>Загрузка...</h2>
        </div>
      </div>
    );
  }

  if (ownAmbassador?.status === "Одобрен") {
    return (
      <div className="page">
        <h1>🤝 Кабинет амбассадора</h1>

        <div className="card">
          <h2>✅ Вы одобрены</h2>
          <p>Ваш статус: {ownAmbassador.status}</p>
          <p>Ваш реф-код: {ownAmbassador.referral_code}</p>
          
<p>🔗 Реф-ссылка готова</p>
<p style={{ fontSize: "16px", opacity: 0.8 }}>
  Нажмите кнопку ниже, чтобы поделиться
</p>

<button
  className="vote-btn"
  onClick={() => {
    const link = `https://t.me/MissTelegramOfficialBot?start=amb_${ownAmbassador.referral_code}`;
    const text = `👑 MISS TELEGRAM\n\nПрисоединяйся к конкурсу красоты в Telegram:\n${link}`;

    if ((window as any).Telegram?.WebApp?.openTelegramLink) {
      (window as any).Telegram.WebApp.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`
      );
    } else {
      navigator.clipboard.writeText(link);
      alert("Ссылка скопирована");
    }
  }}
>
  🔗 Поделиться ссылкой
</button>
          <hr />
          <p>👑 Приглашено участниц: {participantsCount}</p>
          <p>👀 Приглашено зрителей: {viewersCount}</p>
          <p>⭐ Голосов через вас: {votesCount}</p>
          <p>🎁 Подарков через вас: {giftsCount}</p>
		  <hr />

<div className="card">

<h2>📊 Общая статистика</h2>

<p>👑 Всего приглашено: {myContestants.length}</p>

<p>🟢 Опубликовано: {publishedCount}</p>

<p>🟡 На модерации: {pendingCount}</p>

<p>🔴 Отклонено: {rejectedCount}</p>

<hr />

<p>⭐ Всего голосов: {totalVotes}</p>

<p>🎁 Всего Stars: {totalStars}</p>

</div>
<h3>👑 Мои приглашённые</h3>

{myContestants.length === 0 ? (
  <p>Пока нет приглашённых участниц.</p>
) : (
  myContestants.map((item) => (
    <div
  key={item.id}
  className="card"
  onClick={() => navigate(`/contestant/${item.id}`)}
  style={{ cursor: "pointer" }}
>
      <h3>👑 {item.name}</h3>
      <p>🆔 Код: {item.contestant_code || "не указан"}</p>
      <p>🟡 Статус: {item.status}</p>
      <p>⭐ Голосов: {item.votes || 0}</p>
      <p>🎁 Stars: {item.stars || 0}</p>
	  <button
  className="vote-btn"
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/contestant/${item.id}`);
  }}
>
  🔗 Открыть карточку
</button>
    </div>
  ))
)}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
	<button
    className="vote-btn"
    onClick={() => navigate(-1)}
>
    ← Назад
</button>
      <h1>🤝 Амбассадор</h1>

      {errorMessage && (
        <div className="card">
          <h2>Ошибка</h2>
          <p>{errorMessage}</p>
        </div>
      )}

      {getTelegramUser()?.id === ADMIN_TELEGRAM_ID && (
        <div className="card">
          <h2>🛡 Модерация амбассадоров</h2>

          {pendingAmbassadors.length === 0 && (
            <p>Новых заявок амбассадоров нет.</p>
          )}

          {pendingAmbassadors.map((ambassador) => (
            <div className="card" key={ambassador.id}>
              <h3>🤝 {ambassador.name}</h3>
              <p>🌍 {ambassador.country}, {ambassador.city}</p>
              <p>🔗 {ambassador.main_social_link}</p>
              <p>👥 Аудитория: {ambassador.audience_size}</p>
              <p>🎯 Кого приглашает: {ambassador.invite_focus}</p>
              <p>📣 Опыт: {ambassador.promotion_experience}</p>
              <p>💬 Причина: {ambassador.reason}</p>
              <p>🆔 Telegram ID: {ambassador.telegram_id}</p>

              <button
                className="vote-btn"
                onClick={() => approveAmbassador(ambassador)}
              >
                🟢 Одобрить
              </button>

              <button
                className="gift-btn"
                onClick={() => rejectAmbassador(ambassador)}
              >
                🔴 Отклонить
              </button>
            </div>
          ))}
        </div>
      )}

      {ownAmbassador?.status === "На модерации" || sent ? (
        <div className="card">
          <h2>✅ Заявка отправлена</h2>
          <p>Ваша заявка на амбассадора отправлена на модерацию.</p>
          <p>После проверки откроется личный кабинет амбассадора.</p>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>Приглашай участниц и зрителей</h2>
            <p>И получай вознаграждение за развитие MISS TELEGRAM.</p>

            {!showForm && (
              <button className="vote-btn" onClick={() => setShowForm(true)}>
                🤝 Стать амбассадором проекта
              </button>
            )}
          </div>

          {showForm && (
            <>
              <div className="card">
                <h2>📝 Анкета амбассадора</h2>

                <input className="form-input" placeholder="Ваше имя" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
                <input className="form-input" placeholder="Страна" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
                <input className="form-input" placeholder="Город" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                <input className="form-input" placeholder="Ссылка на Telegram / Instagram / TikTok" value={form.main_social_link} onChange={(e) => updateField("main_social_link", e.target.value)} />
                <input className="form-input" placeholder="Размер аудитории" value={form.audience_size} onChange={(e) => updateField("audience_size", e.target.value)} />
                <textarea className="form-input" placeholder="Кого планируете приглашать?" value={form.invite_focus} onChange={(e) => updateField("invite_focus", e.target.value)} />
                <textarea className="form-input" placeholder="Опыт продвижения" value={form.promotion_experience} onChange={(e) => updateField("promotion_experience", e.target.value)} />
                <textarea className="form-input" placeholder="Почему хотите стать амбассадором?" value={form.reason} onChange={(e) => updateField("reason", e.target.value)} />
              </div>

              <div className="card">
                <h2>📜 Правила участия</h2>

                <button className="gift-btn" onClick={() => setShowRules(!showRules)}>
                  {showRules ? "Скрыть правила" : "Прочитать правила"}
                </button>

                {showRules && (
  <div style={{ textAlign: "left" }}>
    <h3>📜 Правила программы амбассадоров MISS TELEGRAM</h3>

    <p><b>1. Общие положения</b></p>
    <p>Программа Амбассадоров MISS TELEGRAM создана для пользователей, которые помогают развитию международного конкурса красоты MISS TELEGRAM.</p>
    <p>Основная задача Амбассадора — приглашать новых участниц конкурса с помощью своей персональной реферальной ссылки.</p>
    <p>После одобрения заявки каждому Амбассадору автоматически присваивается персональный реферальный код и реферальная ссылка.</p>
    <p>Все участницы, зарегистрировавшиеся по этой ссылке, закрепляются за данным Амбассадором на период конкурса.</p>

    <p><b>2. Основная цель участия</b></p>
    <p>Амбассадор приглашает новых участниц, помогает развивать конкурс, продвигает MISS TELEGRAM и может получать вознаграждение от активности приглашённых участниц.</p>

    <p><b>3. Как учитываются приглашённые участницы</b></p>
    <p>Участница считается приглашённой Амбассадором, если она зарегистрировалась по его персональной реферальной ссылке, прошла модерацию и была опубликована в конкурсе.</p>

    <p><b>4. Вознаграждение Амбассадора</b></p>
    <p>Вознаграждение Амбассадора начисляется по итогам завершённого конкурса.</p>
    <p>На момент публикации настоящих Правил размер вознаграждения составляет <b>10% от общего количества Telegram Stars</b>, полученных всеми приглашёнными участницами Амбассадора в рамках конкурса.</p>
    <p>При расчёте учитываются Stars, полученные за голоса, Telegram Gifts / подарки и иные Stars-начисления, если они предусмотрены правилами конкурса.</p>
    <p><b>Призовой фонд победительниц MISS TELEGRAM или MISS TELEGRAM STAR не участвует в расчёте вознаграждения Амбассадора.</b></p>
    <p>Амбассадор не получает отдельный процент от призового фонда победительницы.</p>

    <p><b>5. Порядок выплаты</b></p>
    <p>В соответствии с действующими правилами Telegram передача Telegram Stars между пользователями напрямую невозможна.</p>
    <p>Поэтому выплата вознаграждения осуществляется не в Telegram Stars, а в Telegram Tokens / TON после завершения конкурса и обработки начислений.</p>
    <p>После завершения конкурса система рассчитывает сумму вознаграждения, учитывает комиссии и ограничения Telegram, после чего выплата производится в TON.</p>
    <p>На момент публикации настоящих Правил Telegram может устанавливать срок ожидания перед выводом Stars, включая период около 21 дня. Этот срок может быть изменён Telegram в любое время.</p>

    <p><b>6. Получение выплаты</b></p>
    <p>После завершения конкурса Амбассадор получает уведомление в Telegram-боте MISS TELEGRAM.</p>
    <p>В уведомлении указывается количество Stars, сумма вознаграждения, возможные комиссии и итоговая сумма в TON.</p>
    <p>Для получения выплаты Амбассадор должен ответить на уведомление и предоставить адрес своего TON-кошелька.</p>
    <p>Амбассадор самостоятельно несёт ответственность за правильность указанного адреса кошелька.</p>

    <p><b>7. Telegram Stars, Gifts и TON</b></p>
    <p>Telegram Stars, Telegram Gifts и Telegram Tokens / TON являются сервисами платформы Telegram.</p>
    <p>Организаторы MISS TELEGRAM не управляют правилами Telegram и не влияют на сроки вывода, комиссии, курс TON, работу Telegram Wallet, Fragment или доступность функций Telegram.</p>
    <p>Если Telegram изменит правила Stars, Gifts, TON, Fragment или Telegram Wallet, порядок начисления и выплаты вознаграждений может быть изменён без предварительного согласования.</p>

    <p><b>8. Личный кабинет Амбассадора</b></p>
    <p>В личном кабинете отображаются приглашённые участницы, приглашённые зрители, голоса, подарки, Stars и статистика.</p>
    <p>Эти данные используются для расчёта итогового вознаграждения после завершения конкурса.</p>

    <p><b>9. Обязанности Амбассадора</b></p>
    <p>Амбассадор обязуется приглашать только реальных пользователей, использовать законные способы продвижения, соблюдать правила Telegram и MISS TELEGRAM, не вводить пользователей в заблуждение и не обещать победу.</p>

    <p><b>10. Запрещается</b></p>
    <p>Запрещается использовать ботов, фейковые аккаунты, накрутки голосов и подарков, сервисы мошенничества, спам, ложную информацию и выдавать себя за официального представителя администрации.</p>
    <p>При нарушении правил администрация вправе отказать в начислении вознаграждения, аннулировать бонусы, ограничить аккаунт или удалить Амбассадора из программы.</p>

    <p><b>11. Юридический статус</b></p>
    <p>Участие в программе является добровольным. Статус Амбассадора не является трудоустройством. Амбассадор не является сотрудником, агентом, партнёром или официальным представителем MISS TELEGRAM.</p>

    <p><b>12. Налоги</b></p>
    <p>Амбассадор самостоятельно несёт ответственность за соблюдение законодательства своей страны, включая возможное декларирование доходов и уплату налогов.</p>

    <p><b>13. Ограничение ответственности</b></p>
    <p>Организаторы не гарантируют получение дохода каждым Амбассадором. Размер вознаграждения зависит от активности приглашённых участниц, количества Stars, правил Telegram, комиссий и итогов завершённого конкурса.</p>

    <p><b>14. Изменение правил</b></p>
    <p>Администрация MISS TELEGRAM вправе изменять правила, размер вознаграждения, порядок начисления и выплаты, сроки выплаты, вводить бонусы, приостанавливать или прекращать программу Амбассадоров.</p>
    <p>Изменения вступают в силу с момента публикации новой редакции Правил в приложении MISS TELEGRAM.</p>

    <p><b>15. Согласие с Правилами</b></p>
    <p>Отправляя заявку, пользователь подтверждает, что ознакомился с Правилами, понимает порядок начисления вознаграждения, принимает условия программы и обязуется соблюдать Правила MISS TELEGRAM.</p>
  </div>
)}

                <label>
                  <input
                    type="checkbox"
                    checked={form.agreed_rules}
                    onChange={(e) => updateField("agreed_rules", e.target.checked)}
                  />{" "}
                  Я согласен с правилами участия
                </label>
              </div>

              <button className="vote-btn" onClick={submitAmbassador}>
                🕒 Отправить заявку на модерацию
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function LiveApplicationPage() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [description, setDescription] = useState("");
    const [requestedDate, setRequestedDate] = useState("");
    const [requestedTime, setRequestedTime] = useState("");
    const [language, setLanguage] = useState("");
    const [country, setCountry] = useState("");
    const [internet, setInternet] = useState("");
    const [plan, setPlan] = useState("");
    const [rulesAccepted, setRulesAccepted] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
	const [isContestant, setIsContestant] = useState(false);
    const [checkingContestant, setCheckingContestant] = useState(true);
	const [busySlots, setBusySlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
	const [canGoLive, setCanGoLive] = useState(false);
    const [myApprovedLive, setMyApprovedLive] = useState<any>(null);

    const timeSlots = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
    useEffect(() => {
    window.scrollTo(0, 0);
    checkContestantAccess();
}, []);

useEffect(() => {
    if (requestedDate) {
        loadBusySlots(requestedDate);
    } else {
        setBusySlots([]);
    }
}, [requestedDate]);

async function loadBusySlots(date: string) {
    setLoadingSlots(true);

    const { data } = await supabase
        .from("live_applications")
        .select("requested_time")
        .eq("requested_date", date)
        .in("status", ["На рассмотрении", "Одобрена"]);

    const slots = (data || [])
        .map((item: any) => item.requested_time)
        .filter(Boolean);

    setBusySlots(slots);
    setLoadingSlots(false);
}


async function checkContestantAccess() {
    const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

    if (!telegramUser?.id) {
        setIsContestant(false);
        setCheckingContestant(false);
        return;
    }

const { data } = await supabase
    .from("contestants")
    .select("id,status")
    .eq("telegram_id", telegramUser.id)
    .eq("status", "Опубликована в конкурсе")
    .limit(1);

setIsContestant((data || []).length > 0);

const { data: liveAppData } = await supabase
    .from("live_applications")
    .select("*")
    .eq("telegram_id", telegramUser.id)
    .eq("status", "Одобрена")
    .order("updated_at", { ascending: false })
    .limit(1);

const approvedLive = liveAppData?.[0] || null;

setMyApprovedLive(approvedLive);
setCanGoLive(!!approvedLive);

    setCheckingContestant(false);
}
async function submitLiveApplication() {
    setMessage("");

    if (checkingContestant) {
        setMessage("⏳ Проверяем доступ...");
        return;
    }

    if (!isContestant) {
        setMessage("❌ Подать заявку на прямой эфир могут только участницы конкурса.");
        return;
    }

        if (!title.trim() || !topic.trim() || !requestedDate || !requestedTime) {
            setMessage("❌ Заполните название, тему, дату и время.");
            return;
        }

        if (!rulesAccepted) {
            setMessage("❌ Нужно подтвердить правила эфира.");
            return;
        }

        setSending(true);

        const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

        const { error } = await supabase.from("live_applications").insert({
            telegram_id: telegramUser?.id || null,
            contestant_name:
                `${telegramUser?.first_name || ""} ${telegramUser?.last_name || ""}`.trim() ||
                telegramUser?.username ||
                "",
            requested_date: requestedDate,
            requested_time: requestedTime,
            topic,
            language,
            description: `
Название эфира: ${title}
Описание: ${description}
Страна эфира: ${country}
Интернет: ${internet}
Что планирует показать: ${plan}
            `,
            rules_accepted: rulesAccepted,
            status: "На рассмотрении",
        });

        setSending(false);

        if (error) {
            if (error.code === "23505") {
                setMessage("❌ Это время уже занято. Выберите другое время.");
                return;
            }

            setMessage("❌ Ошибка отправки заявки: " + error.message);
            return;
        }

        setMessage("✅ Заявка отправлена на рассмотрение.");
    }
if (canGoLive) {
    return (
        <div className="page">
            <button
                className="vote-btn"
                onClick={() => navigate(`/live-host?id=${myApprovedLive?.id}`)}
            >
                🎥 Начать прямой эфир
            </button>

            <div className="card">
                <h2>Ваш эфир одобрен</h2>

                <p><b>Название:</b> {myApprovedLive?.title}</p>
                <p><b>Дата:</b> {myApprovedLive?.requested_date}</p>
                <p><b>Время:</b> {myApprovedLive?.requested_time}</p>

                <br />

                <button
                    className="vote-btn"
                    onClick={() => navigate(`/live-host?id=${myApprovedLive?.id}`)}
                >
                    ▶ Начать эфир
                </button>
            </div>
        </div>
    );
}	
	
if (checkingContestant) {
    return (
        <div className="page">
            <button className="vote-btn" onClick={() => navigate(-1)}>
                ← Назад
            </button>

            <h1>🎥 Заявка на прямой эфир</h1>

            <div className="card">
                <h2>⏳ Проверяем доступ...</h2>
            </div>
        </div>
    );
}

if (!isContestant) {
    return (
        <div className="page">
            <button className="vote-btn" onClick={() => navigate(-1)}>
                ← Назад
            </button>

            <h1>🎥 Заявка на прямой эфир</h1>

            <div className="card">
                <h2>❌ Доступ закрыт</h2>
                <p>Подать заявку на прямой эфир могут только участницы, опубликованные в конкурсе.</p>
                <p>Последняя анкета должна иметь статус: Опубликована в конкурсе.</p>
            </div>
        </div>
    );
}
    return (
        <div className="page">
            <button className="vote-btn" onClick={() => navigate(-1)}>
                ← Назад
            </button>

            <h1>🎥 Заявка на прямой эфир</h1>

            <div className="card">
                <h2>Шаг {step} из 5</h2>
            </div>

            {step === 1 && (
                <div className="card">
                    <h2>🎤 Общая информация</h2>

                    <input
                        className="form-input"
                        placeholder="Название эфира"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <input
                        className="form-input"
                        placeholder="Тема эфира"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />

                    <textarea
                        className="form-input"
                        placeholder="Краткое описание эфира"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <button className="vote-btn" onClick={() => setStep(2)}>
                        Далее
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="card">
                    <h2>📅 Выберите дату</h2>

                    <input
                        className="form-input"
                        type="date"
                        value={requestedDate}
                        onChange={(e) => setRequestedDate(e.target.value)}
                    />

                    <button className="vote-btn" onClick={() => setStep(1)}>
                        Назад
                    </button>

                    <button className="vote-btn" onClick={() => setStep(3)}>
                        Далее
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="card">
                    <h2>🕒 Выберите время</h2>

                    {loadingSlots && <p>⏳ Загружаем занятые слоты...</p>}

{timeSlots.map((time) => {
    const isBusy = busySlots.includes(time);
    const isSelected = requestedTime === time;

    return (
        <button
            key={time}
            className={isBusy ? "gift-btn" : "vote-btn"}
            disabled={isBusy}
            onClick={() => {
                if (!isBusy) {
                    setRequestedTime(time);
                }
            }}
            style={{
                opacity: isBusy ? 0.45 : 1,
                border: isSelected ? "2px solid #00ff99" : undefined,
                cursor: isBusy ? "not-allowed" : "pointer",
            }}
        >
            {time} {isBusy ? "🚫 занято" : isSelected ? "✅" : ""}
        </button>
    );
})}

                    <button className="vote-btn" onClick={() => setStep(2)}>
                        Назад
                    </button>

                    <button className="vote-btn" onClick={() => setStep(4)}>
                        Далее
                    </button>
                </div>
            )}

            {step === 4 && (
                <div className="card">
                    <h2>🎤 Вопросы участнице</h2>

                    <input
                        className="form-input"
                        placeholder="Язык эфира"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    />

                    <input
                        className="form-input"
                        placeholder="Из какой страны будет эфир?"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                    />

                    <input
                        className="form-input"
                        placeholder="У вас стабильный интернет? Да / Нет"
                        value={internet}
                        onChange={(e) => setInternet(e.target.value)}
                    />

                    <textarea
                        className="form-input"
                        placeholder="Что планируете показать?"
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                    />

                    <button className="vote-btn" onClick={() => setStep(3)}>
                        Назад
                    </button>

                    <button className="vote-btn" onClick={() => setStep(5)}>
                        Далее
                    </button>
                </div>
            )}

            {step === 5 && (
                <div className="card">
                    <h2>✅ Правила эфира</h2>

                    <p>Во время эфира запрещено:</p>
                    <p>• 18+ контент</p>
                    <p>• оскорбления</p>
                    <p>• реклама без разрешения</p>
                    <p>• политическая агитация</p>
                    <p>• нарушение правил Telegram</p>

                    <label>
                        <input
                            type="checkbox"
                            checked={rulesAccepted}
                            onChange={(e) => setRulesAccepted(e.target.checked)}
                        />{" "}
                        Я ознакомилась с правилами
                    </label>

                    <button className="vote-btn" onClick={() => setStep(4)}>
                        Назад
                    </button>

                    <button
                        className="vote-btn"
                        onClick={submitLiveApplication}
                        disabled={sending}
                    >
                        📨 {sending ? "Отправляем..." : "Отправить заявку"}
                    </button>

                    {message && <p>{message}</p>}
                </div>
            )}
        </div>
    );
}

function ViewerStream() {
  const cameraTracks = useTracks([Track.Source.Camera], {
    onlySubscribed: true,
  });

  const hostTrack = cameraTracks.find(
    (trackRef) => trackRef.participant.identity.startsWith("host-")
  );

  return (
    <>
      <RoomAudioRenderer />

      {hostTrack ? (
        <VideoTrack
          trackRef={hostTrack}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            background: "#000",
          }}
        />
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          Ожидание видео ведущей…
        </div>
      )}
    </>
  );
}

function LivePage() {
    const navigate = useNavigate();

    const [liveUrl, setLiveUrl] = useState("");
    const [liveTitle, setLiveTitle] = useState("MISS TELEGRAM");
    const [isLive, setIsLive] = useState(false);
	const [hostMessage, setHostMessage] = useState("");
	const [liveData, setLiveData] = useState<any>(null);
	const [liveContestant, setLiveContestant] = useState<any>(null);
	const [token, setToken] = useState("");
	

    useEffect(() => {
        window.scrollTo(0, 0);
        loadLiveSettings();
		fetch("https://miss-telegram-token-server.onrender.com/token?role=viewer")
            .then((r) => r.json())
            .then((d) => setToken(d.token));
    }, []);

    async function loadLiveSettings() {
        const { data } = await supabase
            .from("settings")
            .select("*")
            .eq("key", "live_stream")
            .maybeSingle();

        if (data?.value) {
            setLiveUrl(data.value.url || "");
            setLiveTitle(data.value.title || "MISS TELEGRAM");
            setIsLive(data.value.isLive || false);
			setHostMessage(data.value.hostMessage || "");
			setLiveData(data.value);
			if (data.value.telegram_id) {
    const { data: contestantData } = await supabase
        .from("contestants")
        .select("*")
        .eq("telegram_id", data.value.telegram_id)
        .eq("status", "Опубликована в конкурсе")
        .order("created_at", { ascending: false })
        .limit(1);

    setLiveContestant(contestantData?.[0] || null);
}
        }
    }

    return (
    <div className="page">
        <button className="vote-btn" onClick={() => navigate(-1)}>
            ← Назад
        </button>

        <h1>🎥 Прямой эфир</h1>

        {isLive ? (
    <>
        <div className="card">
            <h2>🔴 LIVE <span style={{ fontSize: "18px" }}>👁 1245</span></h2>
            <p>👑 {liveTitle}</p>
        </div>

        <div className="card">
            <h2>🎥 ВИДЕО ЭФИРА</h2>

            <div
                style={{
                    width: "100%",
                    minHeight: "220px",
                    border: "1px solid #d4af37",
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "15px",
                    marginBottom: "15px",
                    background: "linear-gradient(180deg, #050005, #16001f)",
                    boxShadow: "0 0 18px rgba(212,175,55,0.25)",
                }}
            >
                <div>
                    {liveUrl ? (
    <>
    <LiveKitRoom
        serverUrl="wss://misstelegram-suaxuq32.livekit.cloud"
        token={token}
        connect={true}
        style={{
            height: "500px",
            borderRadius: "18px",
            overflow: "hidden",
        }}
    >
        <ViewerStream />
    </LiveKitRoom>
</>
) : (
    <>
        <p>🔴 LIVE</p>
        <p>Ссылка на трансляцию ещё не добавлена.</p>
    </>
)}
                </div>
            </div>
        </div>

        {hostMessage && (
            <div className="card">
                <h2>🎤 Сообщение ведущего</h2>
                <p>{hostMessage}</p>
            </div>
        )}

        <div className="card">
            <h2>👑 Участница в эфире</h2>

            {liveData?.contestant_name ? (
             <>
            <h3>{liveContestant?.name || liveData.contestant_name}</h3>

            {liveData.topic && (
                <p>🎙️ {liveData.topic}</p>
            )}

            <button
                className="vote-btn"
                onClick={() => navigate(`/contestant/${liveContestant?.slug}`)}
            >
                ⭐ Голосовать
            </button>

            <button
                className="vote-btn"
                onClick={() => navigate(`/contestants/${liveContestant?.id}`)}
            >
                🎁 Отправить Gift
            </button>
        </>
    ) : (
        <>
            <p>Сейчас участница ещё не выбрана.</p>
            <p>Позже здесь будет фото, имя и кнопки поддержки.</p>
        </>
    )}
</div>

        
    </>
) : (
            <>
                <div className="card">
                    <h2>⚫ Сейчас прямой эфир не ведётся</h2>
                    <p>Следующая трансляция будет объявлена в календаре конкурса.</p>

                    <button
                        className="vote-btn"
                        onClick={() => navigate("/contest-calendar")}
                    >
                        📅 Календарь конкурса
                    </button>
                </div>

                <div className="card">
                    <h2>👑 Что проходит в прямых эфирах</h2>
                    <p>• Представление участниц</p>
                    <p>• Интервью</p>
                    <p>• Полуфиналы</p>
                    <p>• Финал конкурса</p>
                    <p>• Объявление победительниц</p>
                    <p>• Специальные события конкурса</p>
                </div>
            </>
        )}
    </div>
);
}

function LiveAdmin() {
    const navigate = useNavigate();
	
	const params = new URLSearchParams(window.location.search);
    const openAppId = Number(params.get("app_id"));

    const [liveUrl, setLiveUrl] = useState("");
    const [liveTitle, setLiveTitle] = useState("Финал MISS TELEGRAM");
    const [isLive, setIsLive] = useState(false);
    const [message, setMessage] = useState("");
    const [hostMessage, setHostMessage] = useState(
        "Добро пожаловать на прямой эфир MISS TELEGRAM!"
    );
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<any>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadLiveSettings();
        loadApplications();
    }, []);

    async function loadLiveSettings() {
        const { data } = await supabase
            .from("settings")
            .select("*")
            .eq("key", "live_stream")
            .maybeSingle();

        if (data?.value) {
            setLiveUrl(data.value.url || "");
            setLiveTitle(data.value.title || "Финал MISS TELEGRAM");
            setIsLive(data.value.isLive || false);
            setHostMessage(
                data.value.hostMessage ||
                    "Добро пожаловать на прямой эфир MISS TELEGRAM!"
            );
        }
    }
	
	

    async function loadApplications() {
        const { data } = await supabase
            .from("live_applications")
            .select("*")
            .order("requested_date", { ascending: true })
            .order("requested_time", { ascending: true });

        if (data) {
            setApplications(data);

            if (openAppId) {
                const found = data.find((app: any) => app.id === openAppId);
               if (found) {
                   setSelectedApplication(found);

                   setTimeout(() => {
                       window.scrollTo({
                           top: document.body.scrollHeight,
                           behavior: "smooth",
        });
    }, 500);
}
    }
}}

    async function saveLiveSettings(nextIsLive = isLive) {
        setMessage("");


const { data: currentLive } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "live_stream")
    .maybeSingle();

const value = {
    ...(currentLive?.value || {}),

    url: liveUrl,
    title: liveTitle,
    isLive: nextIsLive,
    hostMessage,

    notification_sent: nextIsLive ? false : true,
    updated_at: new Date().toISOString(),
};

        const { error } = await supabase
            .from("settings")
            .upsert(
                {
                    key: "live_stream",
                    value,
                },
                { onConflict: "key" }
            );

        if (error) {
            setMessage("❌ Ошибка сохранения: " + error.message);
            return;
        }

        setIsLive(nextIsLive);
        setMessage("✅ Сохранено");
    }

    async function updateApplicationStatus(status: string) {
        if (!selectedApplication) return;

        const updateData: any = {
            status,
            updated_at: new Date().toISOString(),
        };

        if (status === "Одобрена") {
    updateData.approved_date = selectedApplication.requested_date;
    updateData.approved_time = selectedApplication.requested_time;

    const liveValue = {
        url: liveUrl,
        title: selectedApplication.contestant_name || liveTitle || "MISS TELEGRAM",
        isLive: true,
        hostMessage,
        contestant_name: selectedApplication.contestant_name || "",
		telegram_id: selectedApplication.telegram_id || null,
        topic: selectedApplication.topic || "",
        application_id: selectedApplication.id,
        requested_date: selectedApplication.requested_date,
        requested_time: selectedApplication.requested_time,
        updated_at: new Date().toISOString(),
    };

    await supabase
        .from("settings")
        .upsert(
            {
                key: "live_stream",
                value: liveValue,
            },
            { onConflict: "key" }
        );
}

        const { error } = await supabase
            .from("live_applications")
            .update(updateData)
            .eq("id", selectedApplication.id);

        if (error) {
            setMessage("❌ Ошибка обновления заявки: " + error.message);
            return;
        }

        setSelectedApplication({ ...selectedApplication, ...updateData });
        await loadApplications();
        setMessage("✅ Заявка обновлена");
    }

    return (
        <div className="page">
            <button className="vote-btn" onClick={() => navigate(-1)}>
                ← Назад
            </button>

            <h1>🎥 Прямые эфиры</h1>

            <div className="card">
                <h2>{isLive ? "🟢 Сейчас в эфире" : "⚫ Эфир не запущен"}</h2>
                <p>Статус трансляции для конкурса MISS TELEGRAM.</p>
            </div>

            <div className="card">
                <h2>🎥 Настройки эфира</h2>

                <input
                    className="form-input"
                    placeholder="Название эфира"
                    value={liveTitle}
                    onChange={(e) => setLiveTitle(e.target.value)}
                />

                <input
                    className="form-input"
                    placeholder="URL видеотрансляции"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                />

                <textarea
                    className="form-input"
                    placeholder="Сообщение ведущего"
                    value={hostMessage}
                    onChange={(e) => setHostMessage(e.target.value)}
                />

                <button className="vote-btn" onClick={() => saveLiveSettings()}>
                    💾 Сохранить
                </button>
            </div>

            <div className="card">
                <h2>Управление эфиром</h2>

                <button className="vote-btn" onClick={() => saveLiveSettings(true)}>
                    ▶ Запустить эфир
                </button>

                <button className="vote-btn" onClick={() => saveLiveSettings(false)}>
                    ■ Завершить эфир
                </button>

                <button
                    className="vote-btn"
                    onClick={() => {
                        alert(`🔴 Прямой эфир начался!

👑 MISS TELEGRAM

📢 Сообщение ведущего:

${hostMessage}

✨ Присоединяйтесь прямо сейчас.

▶ Смотреть эфир
${liveUrl}`);
                    }}
                >
                    👁 Предпросмотр уведомления
                </button>

                {message && <p>{message}</p>}
            </div>

            <div className="card">
                <h2>📋 Заявки на прямой эфир</h2>

                {applications.length === 0 ? (
                    <p>Новых заявок нет.</p>
                ) : (
                    applications.map((app) => (
                        <div
                            key={app.id}
                            style={{
                                border: "1px solid #d4af37",
                                borderRadius: "12px",
                                padding: "12px",
                                marginBottom: "12px",
                            }}
                        >
                            <p>
                                <b>👑 {app.contestant_name || "Без имени"}</b>
                            </p>
                            <p>📅 {app.requested_date}</p>
                            <p>🕒 {app.requested_time}</p>
                            <p>🎯 {app.status}</p>

                            <button
                                className="vote-btn"
                                onClick={() => setSelectedApplication(app)}
                            >
                                Открыть
                            </button>
                        </div>
                    ))
                )}
            </div>

            {selectedApplication && (
                <div className="card">
                    <h2>📋 Заявка участницы</h2>

                    <p>
                        <b>👑 {selectedApplication.contestant_name || "Без имени"}</b>
                    </p>
                    <p>📅 Дата: {selectedApplication.requested_date}</p>
                    <p>🕒 Время: {selectedApplication.requested_time}</p>
                    <p>📌 Статус: {selectedApplication.status}</p>
                    <p>🌍 Язык: {selectedApplication.language || "не указан"}</p>
                    <p>📝 Описание: {selectedApplication.description || "не указано"}</p>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                            className="vote-btn"
                            onClick={() => updateApplicationStatus("Одобрена")}
                        >
                            ✅ Подтвердить
                        </button>

                        <button
                            className="gift-btn"
                            onClick={() => updateApplicationStatus("Отклонена")}
                        >
                            ❌ Отклонить
                        </button>

                        <button
                            className="vote-btn"
                            onClick={() => setSelectedApplication(null)}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ContestCalendar() {
    const navigate = useNavigate();
    const [nextLive, setNextLive] = useState<any>(null);
    const [loadingLive, setLoadingLive] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadNextLive();
    }, []);

    async function loadNextLive() {
        setLoadingLive(true);

        const now = new Date();
const today = now.toISOString().split("T")[0];

const { data } = await supabase
    .from("live_applications")
    .select("*")
    .eq("status", "Одобрена")
    .gte("requested_date", today)
    .order("requested_date", { ascending: true })
    .order("requested_time", { ascending: true });

const futureLives = (data || []).filter((live: any) => {
    const liveStart = new Date(`${live.requested_date}T${live.requested_time}:00`);
    const liveEnd = new Date(liveStart.getTime() + 60 * 60 * 1000);

    return now <= liveEnd;
});

setNextLive(futureLives[0] || null);

        
        setLoadingLive(false);
    }

    return (
        <div className="page">
            <button className="vote-btn" onClick={() => navigate(-1)}>
                ← Назад
            </button>

            <h1>📅 Календарь конкурса</h1>

            <div className="card">
                <h2>🌍 Новый сезон</h2>
                <p>Старт сезона: будет объявлен отдельно.</p>
                <p>Приём заявок открыт до начала финального этапа.</p>
            </div>

            <div className="card">
                <h2>🎥 Прямые эфиры</h2>

                {loadingLive ? (
                    <p>⏳ Загружаем ближайший эфир...</p>
                ) : nextLive ? (
                    <>
                        <p>
    <b>
        {(() => {
            const now = new Date();
            const liveStart = new Date(`${nextLive.requested_date}T${nextLive.requested_time}:00`);
            const liveEnd = new Date(liveStart.getTime() + 60 * 60 * 1000);

            return now >= liveStart && now <= liveEnd
                ? "🔴 ЭФИР СЕЙЧАС"
                : "Следующий эфир:";
        })()}
    </b>
</p>
                        <p>📅 {nextLive.requested_date}</p>
                        <p>🕕 {nextLive.requested_time}</p>
                        <p>👑 {nextLive.contestant_name || "Участница"}</p>
                        <p>🎙️ Тема: {nextLive.topic || "Будет объявлена"}</p>

                        <button
                            className="vote-btn"
                            onClick={() => navigate("/live")}
                        >
                            {(() => {
    const now = new Date();
    const liveStart = new Date(`${nextLive.requested_date}T${nextLive.requested_time}:00`);
    const liveEnd = new Date(liveStart.getTime() + 60 * 60 * 1000);

    return now >= liveStart && now <= liveEnd
        ? "🔴 Перейти к трансляции"
        : "▶ Смотреть эфир";
})()}
                        </button>
                    </>
                ) : (
                    <>
                        <p>Пока нет одобренных прямых эфиров.</p>
                        <p>Следующая трансляция появится здесь после подтверждения админом.</p>
                    </>
                )}
            </div>

            <div className="card">
                <h2>📸 Приём заявок</h2>
                <p>Участницы подают анкеты, загружают фото и проходят модерацию.</p>
                <p>После одобрения анкета появляется в каталоге участниц.</p>
            </div>

            <div className="card">
                <h2>⭐ Голосование</h2>
                <p>Зрители голосуют за участниц через Telegram Stars.</p>
                <p>1 голос = 100 Telegram Stars.</p>
            </div>

            <div className="card">
                <h2>🎁 Telegram Gifts</h2>
                <p>Подарки формируют отдельный рейтинг MISS TELEGRAM STAR.</p>
                <p>Стоимость подарков учитывается в Telegram Stars.</p>
            </div>

            <div className="card">
                <h2>🏆 Финал</h2>
                <p>После окончания сезона система фиксирует результаты.</p>
                <p>Победительницы определяются по голосам и подаркам.</p>
            </div>

            <div className="card">
                <h2>💰 Выплаты</h2>
                <p>После проверки результатов администрация связывается с победительницами.</p>
                <p>Выплаты производятся согласно правилам конкурса и правилам Telegram.</p>
            </div>
        </div>
    );
}
function Rules() {
    const navigate = useNavigate();
    const [rulesSection, setRulesSection] = useState("");
	useEffect(() => {
    window.scrollTo(0, 0);
}, [rulesSection]);

    if (rulesSection === "participation") {
        return (
            <div className="page">
                <button className="vote-btn" onClick={() => setRulesSection("")}>← Назад</button>
                <h1>📜 Правила участия</h1>

                <div className="card">
                    <h2>👑 Что такое MISS TELEGRAM</h2>
                    <p>MISS TELEGRAM — международный конкурс красоты среди пользователей Telegram.</p>
                    <p>Участницы публикуют свои фотографии, получают голоса и подарки от зрителей и борются за победу.</p>
                </div>

                <div className="card">
                    <h2>👩 Кто может участвовать</h2>
                    <p>• Участнице должно быть 18+.</p>
                    <p>• Аккаунт Telegram должен быть действующим.</p>
                    <p>• Аккаунт должен быть создан не менее чем за 60 дней до подачи заявки.</p>
                    <p>• Разрешается только одна анкета на одного человека.</p>
                    <p>• Участие возможно из разных стран мира.</p>
                </div>

                <div className="card">
                    <h2>📷 Фото и анкета</h2>
                    <p>• Фотографии должны принадлежать самой участнице.</p>
                    <p>• Запрещено использовать чужие фото.</p>
                    <p>• Все заявки проходят модерацию.</p>
                    <p>• Администрация может отклонить заявку при нарушении правил.</p>
                </div>
            </div>
        );
    }

    if (rulesSection === "prize") {
        return (
            <div className="page">
                <button className="vote-btn" onClick={() => setRulesSection("")}>← Назад</button>
                <h1>🏆 Призовой фонд</h1>

                <div className="card">
                    <h2>💰 Два призовых фонда</h2>
                    <p>В конкурсе формируются два независимых призовых фонда.</p>
                    <p>👑 MISS TELEGRAM — фонд по голосам.</p>
                    <p>💎 MISS TELEGRAM STAR — фонд по подаркам Telegram Gifts.</p>
					<hr />

<h2>🥇 Гарантированные призы победительницам</h2>

<p>
👑 Победительница конкурса <b>MISS TELEGRAM</b> гарантированно получает <b>30%</b> призового фонда, сформированного за счёт голосования.
</p>

<p>
💎 Победительница конкурса <b>MISS TELEGRAM STAR</b> гарантированно получает <b>30%</b> призового фонда, сформированного за счёт Telegram Gifts.
</p>

<p>
📊 Размер призовых фондов обновляется автоматически по мере поступления
голосов и подарков.
</p>
<p>
🔒 Все поступившие Telegram Stars автоматически учитываются системой и сразу отображаются в соответствующем призовом фонде конкурса.
</p>

<p>
📈 Размер каждого призового фонда обновляется в режиме реального времени после каждого подтверждённого голоса или Telegram Gift.
</p>
					<hr />


                </div>



                
            </div>
        );
    }

    if (rulesSection === "voting") {
        return (
            <div className="page">
                <button className="vote-btn" onClick={() => setRulesSection("")}>← Назад</button>
                <h1>⭐ Голосование и Gifts</h1>

                <div className="card">
                    <h2>⭐ Голосование</h2>
                    <p>Один голос стоит 100 Telegram Stars.</p>
                    <p>Количество голосов не ограничено.</p>
                    <p>Все голоса учитываются автоматически.</p>
                </div>

                <div className="card">
                    <h2>🎁 Telegram Gifts</h2>
                    <p>Зрители могут отправлять участницам Telegram Gifts.</p>
                    <p>Стоимость подарков учитывается в Telegram Stars.</p>
                    <p>Подарки формируют отдельный рейтинг MISS TELEGRAM STAR.</p>
                </div>
            </div>
        );
    }

    if (rulesSection === "faq") {
        return (
            <div className="page">
                <button className="vote-btn" onClick={() => setRulesSection("")}>← Назад</button>
                <h1>❓ Частые вопросы</h1>

                <div className="card">
                    <h2>Можно участвовать повторно?</h2>
                    <p>Да, если правила конкретного сезона это позволяют.</p>
                </div>

                <div className="card">
                    <h2>Можно менять фотографии?</h2>
                    <p>Да, но изменения могут проходить модерацию.</p>
                </div>

                <div className="card">
                    <h2>Можно удалить анкету?</h2>
                    <p>Да, участница может обратиться в администрацию.</p>
                </div>

                <div className="card">
                    <h2>Как получить выигрыш?</h2>
                    <p>После окончания конкурса администрация проверяет результаты и связывается с победительницами.</p>
                </div>
            </div>
        );
    }

    if (rulesSection === "full") {
        return (
            <div className="page">
                <button className="vote-btn" onClick={() => setRulesSection("")}>← Назад</button>
                <h1>📄 Полные правила конкурса</h1>

                <div className="card">
                    <h2>⚖ Общие условия</h2>
					<div className="card">

<h2>💰 Распределение призового фонда</h2>

<p>
Конкурс формирует два независимых призовых фонда:
</p>

<p>
👑 Призовой фонд MISS TELEGRAM
(формируется за счёт голосования).
</p>

<p>
💎 Призовой фонд MISS TELEGRAM STAR
(формируется за счёт Telegram Gifts).
</p>

<hr />

<p>
🥇 Победительница конкурса <b>MISS TELEGRAM</b> гарантированно получает <b>30%</b> призового фонда голосования.
</p>

<p>
💎 Победительница конкурса <b>MISS TELEGRAM STAR</b> гарантированно получает <b>30%</b> призового фонда Telegram Gifts.
</p>

<hr />

<p>
Оставшаяся часть каждого призового фонда используется согласно Правилам конкурса, включая выплаты другим победителям, бонусные программы, развитие проекта, техническое сопровождение, маркетинг и иные цели, предусмотренные регламентом конкурса.
</p>

</div>
                    <p>Участие в конкурсе является добровольным.</p>
                    <p>Отправляя заявку, участница подтверждает согласие с правилами конкурса.</p>
                    <p>Администрация вправе изменять правила конкурса при необходимости.</p>
                </div>

                <div className="card">
                    <h2>🚫 Запрещено</h2>
                    <p>• Использовать чужие фотографии.</p>
                    <p>• Создавать несколько анкет одним человеком.</p>
                    <p>• Использовать ботов и накрутки.</p>
                    <p>• Обманывать администрацию или зрителей.</p>
                    <p>• Нарушать правила Telegram.</p>
                </div>

                <div className="card">
                    <h2>✅ Решение администрации</h2>
                    <p>Администрация может отклонить заявку, удалить анкету или дисквалифицировать участницу при нарушении правил.</p>
                    <p>Решения администрации по спорным ситуациям являются окончательными.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <button className="vote-btn" onClick={() => navigate(-1)}>← Назад</button>

            <h1>📜 Условия конкурса</h1>

            <div className="card" onClick={() => setRulesSection("participation")}>
                <h2>📜 Правила участия ›</h2>
                <p>Кто может участвовать, возраст, фото и модерация</p>
            </div>

            <div className="card" onClick={() => setRulesSection("prize")}>
                <h2>🏆 Призовой фонд ›</h2>
                <p>MISS TELEGRAM и MISS TELEGRAM STAR</p>
            </div>

            <div className="card" onClick={() => setRulesSection("voting")}>
                <h2>⭐ Голосование и Gifts ›</h2>
                <p>Telegram Stars, голоса и подарки</p>
            </div>

            <div className="card" onClick={() => setRulesSection("faq")}>
                <h2>❓ Частые вопросы ›</h2>
                <p>Ответы на основные вопросы участниц</p>
            </div>

            <div className="card" onClick={() => setRulesSection("full")}>
                <h2>📄 Полные правила ›</h2>
                <p>Юридические условия, запреты и ответственность</p>
            </div>
        </div>
    );
}

function AmbassadorsAdmin() {
    const navigate = useNavigate();

    const ADMIN_TELEGRAM_ID = 678312754;

    const [loading, setLoading] = useState(true);
    const [ambassadors, setAmbassadors] = useState<any[]>([]);
    const [search, setSearch] = useState("");
	const [selectedAmbassador, setSelectedAmbassador] = useState<any>(null);
	const [editingAmbassador, setEditingAmbassador] = useState<any>(null);

    async function loadAmbassadors() {
        setLoading(true);

        const telegramUser =
            (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

        if (telegramUser?.id !== ADMIN_TELEGRAM_ID) {
            setLoading(false);
            return;
        }

        const { data } = await supabase
    .from("ambassadors")
    .select("*")
    .order("created_at", { ascending: false });

const ambassadorsWithStats = await Promise.all(
    (data || []).map(async (ambassador: any) => {
        const referralCode = ambassador.referral_code;

        const { count: contestantsCount } = await supabase
            .from("contestants")
            .select("*", { count: "exact", head: true })
            .eq("ambassador_code", referralCode);

        const { count: viewersCount } = await supabase
            .from("ambassador_referrals")
            .select("*", { count: "exact", head: true })
            .eq("ambassador_code", referralCode)
            .eq("referral_type", "viewer");

        const { data: contestantsData } = await supabase
            .from("contestants")
            .select("id")
            .eq("ambassador_code", referralCode);

        const contestantIds = (contestantsData || []).map((x: any) => x.id);

        let totalStars = 0;

        if (contestantIds.length > 0) {
            const { data: giftsData } = await supabase
                .from("gifts")
                .select("price")
                .in("contestant_id", contestantIds);

            totalStars = (giftsData || []).reduce(
                (sum: number, gift: any) => sum + (gift.price || 0),
                0
            );
        }

        const rewardStars = Math.floor(totalStars * 0.1);

        return {
            ...ambassador,
            contestantsCount: contestantsCount || 0,
            viewersCount: viewersCount || 0,
            totalStars,
            rewardStars,
        };
    })
);

setAmbassadors(ambassadorsWithStats);
setLoading(false);
}
    useEffect(() => {
        loadAmbassadors();
    }, []);
	
	async function updateAmbassadorStatus(id: number, status: string) {
    const { error } = await supabase
        .from("ambassadors")
        .update({ status })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    await loadAmbassadors();
}

    const filteredAmbassadors = ambassadors.filter((item) => {
        const text = `${item.name || ""} ${item.telegram_id || ""} ${item.referral_code || ""} ${item.status || ""}`.toLowerCase();
        return text.includes(search.toLowerCase());
    });

    if (loading) {
        return (
            <div className="page">
                <h1>🤝 Амбассадоры</h1>
                <div className="card">
                    <h2>Загрузка...</h2>
                </div>
            </div>
        );
    }
if (selectedAmbassador) {
    return (
        <div className="page">
            <h1>👁 Подробнее</h1>

            <div className="card">
                <h2>🤝 {selectedAmbassador.name || "Без имени"}</h2>

                <p>🟢 Статус: {selectedAmbassador.status || "не указан"}</p>
                <p>🆔 Telegram ID: {selectedAmbassador.telegram_id || "не указан"}</p>
                <p>🔗 Реф-код: {selectedAmbassador.referral_code || "не указан"}</p>

                <hr />

                <p>🌍 Страна: {selectedAmbassador.country || "не указана"}</p>
                <p>🏙 Город: {selectedAmbassador.city || "не указан"}</p>
                <p>📣 Соцсеть: {selectedAmbassador.main_social_link || "не указана"}</p>
                <p>👥 Аудитория: {selectedAmbassador.audience_size || "не указана"}</p>

                <hr />

                <p>🎯 Кого приглашает: {selectedAmbassador.invite_focus || "не указано"}</p>
                <p>📢 Опыт: {selectedAmbassador.promotion_experience || "не указан"}</p>
                <p>💬 Причина: {selectedAmbassador.reason || "не указана"}</p>

                <hr />

                <p>👑 Участниц: {selectedAmbassador.contestantsCount || 0}</p>
                <p>👥 Зрителей: {selectedAmbassador.viewersCount || 0}</p>
                <p>🎁 Stars участниц: {selectedAmbassador.totalStars || 0}</p>
                <p>💰 Вознаграждение 10%: {selectedAmbassador.rewardStars || 0} Stars</p>

                <button className="vote-btn" onClick={() => setSelectedAmbassador(null)}>
                    ← Назад к списку
                </button>
            </div>
        </div>
    );
}
if (editingAmbassador) {
    return (
        <div className="page">
            <h1>✏ Редактирование</h1>

            <div className="card">
                <input
                    className="form-input"
                    value={editingAmbassador.name || ""}
                    onChange={(e) => setEditingAmbassador({ ...editingAmbassador, name: e.target.value })}
                    placeholder="Имя"
                />

                <input
                    className="form-input"
                    value={editingAmbassador.country || ""}
                    onChange={(e) => setEditingAmbassador({ ...editingAmbassador, country: e.target.value })}
                    placeholder="Страна"
                />

                <input
                    className="form-input"
                    value={editingAmbassador.city || ""}
                    onChange={(e) => setEditingAmbassador({ ...editingAmbassador, city: e.target.value })}
                    placeholder="Город"
                />

                <input
                    className="form-input"
                    value={editingAmbassador.main_social_link || ""}
                    onChange={(e) => setEditingAmbassador({ ...editingAmbassador, main_social_link: e.target.value })}
                    placeholder="Соцсеть"
                />

                <input
                    className="form-input"
                    value={editingAmbassador.audience_size || ""}
                    onChange={(e) => setEditingAmbassador({ ...editingAmbassador, audience_size: e.target.value })}
                    placeholder="Аудитория"
                />

                <textarea
                    className="form-input"
                    value={editingAmbassador.invite_focus || ""}
                    onChange={(e) => setEditingAmbassador({ ...editingAmbassador, invite_focus: e.target.value })}
                    placeholder="Кого приглашает"
                />

                <textarea
                    className="form-input"
                    value={editingAmbassador.promotion_experience || ""}
                    onChange={(e) => setEditingAmbassador({ ...editingAmbassador, promotion_experience: e.target.value })}
                    placeholder="Опыт продвижения"
                />

                <textarea
                    className="form-input"
                    value={editingAmbassador.reason || ""}
                    onChange={(e) => setEditingAmbassador({ ...editingAmbassador, reason: e.target.value })}
                    placeholder="Причина"
                />

                <button
                    className="vote-btn"
                    onClick={async () => {
                        const { error } = await supabase
                            .from("ambassadors")
                            .update({
                                name: editingAmbassador.name,
                                country: editingAmbassador.country,
                                city: editingAmbassador.city,
                                main_social_link: editingAmbassador.main_social_link,
                                audience_size: editingAmbassador.audience_size,
                                invite_focus: editingAmbassador.invite_focus,
                                promotion_experience: editingAmbassador.promotion_experience,
                                reason: editingAmbassador.reason,
                            })
                            .eq("id", editingAmbassador.id);

                        if (error) {
                            alert(error.message);
                            return;
                        }

                        setEditingAmbassador(null);
                        await loadAmbassadors();
                    }}
                >
                    💾 Сохранить
                </button>

                <button className="vote-btn" onClick={() => setEditingAmbassador(null)}>
                    ← Отмена
                </button>
            </div>
        </div>
    );
}
    return (
        <div className="page">
            <h1>🤝 Амбассадоры</h1>

            <div className="card">
                <button className="vote-btn" onClick={() => navigate("/")}>
                    ← Назад
                </button>

                <input
                    className="form-input"
                    placeholder="🔍 Поиск по имени, ID, реф-коду, статусу"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <p>Всего амбассадоров: {filteredAmbassadors.length}</p>
            </div>

            {filteredAmbassadors.length === 0 ? (
                <div className="card">
                    <p>Амбассадоры не найдены.</p>
                </div>
            ) : (
                filteredAmbassadors.map((item) => (
                    <div className="card" key={item.id}>
                        <h2>🤝 {item.name || "Без имени"}</h2>

                        <p>🟢 Статус: {item.status || "не указан"}</p>
                        <p>🆔 Telegram ID: {item.telegram_id || "не указан"}</p>
                        <p>🔗 Реф-код: {item.referral_code || "не указан"}</p>
                        <hr />

                        <p>👑 Участниц: {item.contestantsCount || 0}</p>
                        <p>👥 Зрителей: {item.viewersCount || 0}</p>
                        <p>🎁 Stars участниц: {item.totalStars || 0}</p>
                        <p>💰 Вознаграждение 10%: {item.rewardStars || 0} Stars</p>
                        <hr />

                        <p>🌍 Страна: {item.country || "не указана"}</p>
                        <p>🏙 Город: {item.city || "не указан"}</p>
                        <p>📣 Соцсеть: {item.main_social_link || "не указана"}</p>
                        <p>👥 Аудитория: {item.audience_size || "не указана"}</p>

                        <hr />

                        <p>🎯 Кого приглашает: {item.invite_focus || "не указано"}</p>
                        <p>📢 Опыт: {item.promotion_experience || "не указан"}</p>
                        <p>💬 Причина: {item.reason || "не указана"}</p>
						<hr />

<div style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginTop: "12px"
}}>

<button
    className="vote-btn"
    onClick={() => setEditingAmbassador({ ...item })}
>
✏ Редактировать
</button>

<button
    className="vote-btn"
    onClick={() => setSelectedAmbassador(item)}
>
👁 Подробнее
</button>

<button
    className="vote-btn"
    onClick={() => updateAmbassadorStatus(item.id, "Одобрен")}
>
✅ Одобрить
</button>

<button
    className="vote-btn"
    onClick={() => updateAmbassadorStatus(item.id, "Отклонен")}
>
❌ Отклонить
</button>

<button
    className="vote-btn"
    onClick={() => {
    if (item.telegram_username) {
        window.open(`https://t.me/${item.telegram_username}`, "_blank");
    } else {
        alert("Username не указан");
    }
}}
>
💬 Написать
</button>

<button
    className="vote-btn"
    onClick={() => updateAmbassadorStatus(item.id, "Заблокирован")}
>
🚫 Заблокировать
</button>

</div>
                    </div>
                ))
            )}
			
        </div>
    );
}

function EnableHostMedia() {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    localParticipant
      .enableCameraAndMicrophone()
      .catch((error) => console.error("MEDIA ERROR:", error));
  }, [localParticipant]);

  return null;
}

function HostPreview() {
  const cameraTracks = useTracks([Track.Source.Camera], {
    onlySubscribed: false,
  });

  const localCamera = cameraTracks.find(
    (trackRef) => trackRef.participant.isLocal
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        borderRadius: "18px",
        background: "#000",
      }}
    >
      {localCamera ? (
        <VideoTrack
          trackRef={localCamera}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          Включение камеры…
        </div>
      )}
    </div>
  );
}

function LiveHost() {
  const navigate = useNavigate();
  
  const urlParams = new URLSearchParams(window.location.search);
  const liveApplicationId = urlParams.get("id");

  const [token, setToken] = useState("");
  const [message, setMessage] = useState("Получение токена...");

async function markLiveAsStarted() {
  if (!liveApplicationId) {
    return;
  }

  const { data: settingsData } = await supabase
    .from("settings")
    .select("*")
    .eq("key", "live_stream")
    .maybeSingle();

  const currentValue = settingsData?.value || {};

  const { error } = await supabase
    .from("settings")
    .update({
      value: {
        ...currentValue,
        isLive: true,
        liveApplicationId: liveApplicationId,
      },
    })
    .eq("key", "live_stream");

  if (error) {
    console.error("Ошибка запуска эфира:", error);
  }
}

  useEffect(() => {
    markLiveAsStarted();
    fetch("https://miss-telegram-token-server.onrender.com/token?role=host")
    .then((r) => r.json())
    .then((d) => {
        setToken(d.token);
        setMessage("Токен получен.");
    })
    .catch((e) => {
        console.error(e);
        setMessage("Ошибка получения токена.");
    });
  }, []);

  return (
    <div className="page">
      <button className="vote-btn" onClick={() => navigate(-1)}>
        ← Назад
      </button>

      <h1>🎥 Ведущий эфира</h1>

      <div className="card">
        <p>{message}</p>

        {token && (
          <LiveKitRoom
            serverUrl="wss://misstelegram-suaxuq32.livekit.cloud"
            token={token}
            connect={true}
            video={true}
            audio={true}
            style={{ height: "600px" }}
          >
            <EnableHostMedia />
            <HostPreview />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}

function App() {
  const telegram = (window as any).Telegram?.WebApp;
  const urlParams = new URLSearchParams(window.location.search);
  const urlRef = urlParams.get("ref") || "";
  const savedRef = localStorage.getItem("ambassadorRef") || "";
  const startParam = telegram?.initDataUnsafe?.start_param || urlRef || savedRef;
  console.log("URL SEARCH:", window.location.search);
  console.log("URL REF:", urlRef);
  console.log("START PARAM:", startParam);
  console.log("SAVED REF:", localStorage.getItem("ambassadorRef"));
  
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
  
  async function saveAmbassadorReferral() {
  const telegramUser = telegram?.initDataUnsafe?.user;

  if (!startParam.startsWith("amb_")) {
    return;
  }

  if (!telegramUser?.id) {
    return;
  }

  const ambassadorCode = startParam.replace("amb_", "");

  const { error } = await supabase.from("ambassador_referrals").insert({
    ambassador_code: ambassadorCode,
    visitor_telegram_id: telegramUser.id,
    visitor_username: telegramUser.username || null,
    visitor_first_name: telegramUser.first_name || null,
    visitor_last_name: telegramUser.last_name || null,
    referral_type: "viewer",
  });

  if (error) {
    console.log("ambassador referral error:", error);
  }
}

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
  if (startParam) {
  console.log("START PARAM:", startParam);

  if (startParam.startsWith("amb_")) {
    localStorage.setItem("ambassadorRef", startParam);
  }
}

saveAmbassadorReferral();
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
        <Route path="/ambassadors-admin" element={<AmbassadorsAdmin />} />
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
<Route path="/contest-calendar" element={<ContestCalendar />} />
<Route path="/live" element={<LivePage />} />
<Route path="/live-application" element={<LiveApplicationPage />} />
<Route path="/live-admin" element={<LiveAdmin />} />
<Route path="/live-host" element={<LiveHost />} />


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
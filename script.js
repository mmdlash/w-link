

async function fetchInvestment() {
    try {
      const response = await fetch('http://192.168.1.103:3000/api/stats/investment');
      const data = await response.json();
      document.getElementById('counter').innerText = data.value.toLocaleString('en-US');
    } catch (err) {
      document.getElementById('counter').innerText = 'Error!';
      console.error('Error fetching data:', err);
    }
  }

  async function fetchStats() {
    const [profit, users, top] = await Promise.all([
      fetch('http://192.168.1.103:3000/api/stats/profit').then(res => res.json()),
      fetch('http://192.168.1.103:3000/api/stats/users').then(res => res.json()),
      fetch('http://192.168.1.103:3000/api/stats/top').then(res => res.json())
    ]);
  
    document.getElementById('profit-paid').textContent = profit.value.toLocaleString('en-US');
    document.getElementById('active-users').textContent = users.value.toLocaleString('en-US');
    document.getElementById('top-investor').textContent = top.value.toLocaleString('en-US');
  }
  

//fetchStats();
//
//// اجرا بلافاصله بعد بارگذاری
//fetchInvestment();
//
//// هر ۳ ثانیه یک‌بار اجرا
//setInterval(fetchInvestment, 3000);
//
//setInterval(fetchStats, 2000);





const questions = document.querySelectorAll(".faq-question");

questions.forEach(q => {
  q.addEventListener('touchstart', handleClick);
  q.addEventListener('click', handleClick);
});

function handleClick(event) {
  event.preventDefault(); // جلوگیری از تاخیر موبایل

  const q = event.currentTarget;
  const answer = q.nextElementSibling;
  const icon = q.querySelector(".icon");

  if (answer.style.maxHeight) {
    answer.style.maxHeight = null;
    icon.textContent = "+";
  } else {
    document.querySelectorAll(".faq-answer").forEach(a => {
      a.style.maxHeight = null;
    });
    document.querySelectorAll(".icon").forEach(i => {
      i.textContent = "+";
    });

    answer.style.maxHeight = answer.scrollHeight + "px";
    icon.textContent = "−";
  }
}


















































































document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

document.onkeydown = function (e) {
    if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.ctrlKey && e.keyCode === 85)
    ) {
        e.preventDefault();
        return false;
    }
};

function showCustomAlert(message) {
    document.getElementById('alert-message').innerText = message;
    document.getElementById('custom-alert-overlay').style.display = 'flex';
    document.getElementById('alert-close-btn').focus();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('alert-close-btn').addEventListener('click', function () {
        document.getElementById('custom-alert-overlay').style.display = 'none';
    });

    var input = document.getElementById("answer-input");
    if (input) {
        input.addEventListener("paste", preventPaste);

        input.addEventListener("keydown", function (e) {
            if (
                (e.ctrlKey && (e.key === 'v' || e.key === 'V')) ||
                (e.shiftKey && e.keyCode === 45)
            ) {
                e.preventDefault();
                showCustomAlert("⚠️ Cấm Dán (Paste)! ⚠️\n\nVui lòng nhập đáp án từng từ một để đảm bảo tính trung thực!");
                return false;
            }
            if (e.key === "Enter") {
                e.preventDefault();
                submitAnswer();
            }
        });
    }

    document.addEventListener('selectstart', function (e) { e.preventDefault(); });
});

function preventPaste(e) {
    e.preventDefault();
    showCustomAlert("⚠️ Cấm Dán (Paste)! ⚠️\n\nVui lòng nhập đáp án từng từ một để đảm bảo tính trung thực!");
    return false;
}

let cheatingAttempts = 0;

window.addEventListener('beforeunload', function (e) {
    if (document.getElementById("test-section").style.display === "block" && cheatingAttempts < 2) {
        e.preventDefault();
        e.returnValue = 'Bài kiểm tra đang diễn ra. Bạn có chắc muốn rời khỏi? Kết quả sẽ không được lưu!';
        return 'Bài kiểm tra đang diễn ra. Bạn có chắc muốn rời khỏi? Kết quả sẽ không được lưu!';
    }
});

function handleCheatingAttempt() {
    if (document.getElementById("test-section").style.display === "block" && cheatingAttempts < 2) {
        cheatingAttempts++;
        if (cheatingAttempts === 1) {
            showCustomAlert("⚠️ Cảnh báo! ⚠️\n\nPhát hiện bạn chuyển tab/ẩn cửa sổ. Đây là lần vi phạm đầu tiên.\nLần vi phạm thứ 2 bài làm sẽ bị hủy!");
        } else if (cheatingAttempts >= 2) {
            showCustomAlert("🛑 VI PHẠM QUY CHẾ LẦN 2! 🛑\n\nBài làm của bạn đã bị hủy và bị ghi nhận gian lận.");
            showResult();
        }
    }
}

window.addEventListener('blur', handleCheatingAttempt);

document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
        handleCheatingAttempt();
    }
});

let vocabList = [];
let questions = [];
let current = 0;
let userAnswers = [];

function parseFile() {
    const input = document.getElementById("file-input");
    if (!input.files[0]) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        vocabList = [];
        text.split('\n').forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                vocabList.push({ en: parts[0].trim(), vn: parts.slice(1).join(':').trim() });
            }
        });
        if (vocabList.length > 0) {
            gotoTest();
        } else {
            showCustomAlert("File từ vựng không hợp lệ hoặc không có dữ liệu!");
        }
    };
    reader.readAsText(file);
}

function gotoTest() {
    document.getElementById("upload-section").style.display = "none";
    document.getElementById("test-section").style.display = "block";
    generateQuestions();
    userAnswers = Array(questions.length).fill('');
    current = 0;
    cheatingAttempts = 0;
    showQuestion();
}

function generateQuestions() {
    questions = [];
    let indexes = Array.from(Array(vocabList.length).keys());
    for (let i = indexes.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }
    indexes.forEach(idx => {
        const item = vocabList[idx];
        const type = Math.floor(Math.random() * 4);
        let question, correct;
        if (type === 0) {
            question = `Nghĩa của từ: "${item.en}" là gì?`;
            correct = item.vn;
        } else if (type === 1) {
            let missing = item.en.split('');
            let n = Math.min(3, Math.max(1, Math.floor(Math.random() * 4)));
            let idxs = [];
            while (idxs.length < n) {
                let i = Math.floor(Math.random() * missing.length);
                if (!idxs.includes(i) && missing[i] !== ' ') idxs.push(i);
            }
            idxs.forEach(i => missing[i] = '_');
            question = `Điền đầy đủ từ tiếng Anh: "${missing.join('')}" (Nghĩa: "${item.vn}")`;
            correct = item.en;
        } else if (type === 2) {
            question = `Từ tiếng Anh của: "${item.vn}" là gì?`;
            correct = item.en;
        } else {
            const isCorrect = Math.random() > 0.5;
            let guessEn = item.en, guessVn = item.vn;
            if (!isCorrect) {
                let wrongs = vocabList.filter(v => v.en !== item.en);
                if (wrongs.length > 0) {
                    let wrongItem = wrongs[Math.floor(Math.random() * wrongs.length)];
                    guessVn = wrongItem.vn;
                }
            }
            question = `Từ "${guessEn}" nghĩa là "${guessVn}". Đúng hay sai? (điền: đúng/sai)`;
            correct = isCorrect ? 'đúng' : 'sai';
        }
        questions.push({ question, correct });
    });
}

function showQuestion() {
    if (current >= questions.length) {
        showResult();
        return;
    }
    document.getElementById("progress").innerText = `Câu ${current + 1} / ${questions.length}`;
    document.getElementById("question-area").innerText = questions[current].question;
    document.getElementById("answer-input").value = userAnswers[current] || '';
    document.getElementById("answer-input").focus();

    const backBtn = document.getElementById("back-btn");
    if (backBtn) backBtn.style.display = current > 0 ? "inline-block" : "none";
    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) submitBtn.innerText = current === questions.length - 1 ? "Nộp bài" : "Trả lời";
}

function submitAnswer() {
    userAnswers[current] = document.getElementById("answer-input").value.trim();
    if (current < questions.length - 1) {
        current++;
        showQuestion();
    } else {
        showResult();
    }
}

function prevQuestion() {
    if (current > 0) {
        userAnswers[current] = document.getElementById("answer-input").value.trim();
        current--;
        showQuestion();
    }
}

function getFeedback(score) {
    if (score === 10) {
        return "🤯 TUYỆT VỜI! THIÊN TÀI NGÔN NGỮ ĐÂY RỒI! Bạn không phải người phàm. Giỏi quá đi! 🎉";
    } else if (score >= 9) {
        return "✨ QUÁ ĐỈNH! Gần như hoàn hảo. Trí nhớ siêu phàm! Tiếp tục phát huy nhé! 💪";
    } else if (score >= 7.5) {
        return "👍 RẤT TỐT! Kiến thức vững vàng. Chỉ cần cố gắng thêm chút nữa là chạm đỉnh rồi! 😉";
    } else if (score >= 6) {
        return "😊 ĐẠT YÊU CẦU! Bạn đã nắm được cơ bản. Đừng chủ quan, ôn tập thêm cho chắc chắn nhé! 🤔";
    } else if (score >= 4) {
        return "😐 CẦN CỐ GẮNG! Điểm số hơi khiêm tốn. Từ vựng là cả một quá trình, chăm chỉ hơn nào! 📚";
    } else if (score >= 2) {
        return "😟 BÁO ĐỘNG ĐỎ! Kiến thức đang bị rỗng nhiều. Có vẻ bạn chưa học bài kỹ rồi. Về nhà học lại đi! 🚨";
    } else {
        return "😭 QUÁ TỆ! CHƯA THỂ CHẤP NHẬN ĐƯỢC! Điểm gần như là 0. Bạn đang đùa đúng không? Học lại từ đầu ngay lập tức! 🔪";
    }
}

function showResult() {
    document.getElementById("test-section").style.display = "none";
    document.getElementById("result-section").style.display = "block";
    let html = `<table><tr><th>Đề bài</th><th>Đáp án bạn</th><th>Đúng/Sai</th><th>Đáp án đúng</th></tr>`;
    let score = 0;
    questions.forEach((item, i) => {
        let correct = false;
        if (item.correct.toLowerCase() === 'đúng' || item.correct.toLowerCase() === 'sai') {
            correct = item.correct.toLowerCase() === userAnswers[i].toLowerCase();
        } else {
            correct = item.correct.trim().toLowerCase() === userAnswers[i].trim().toLowerCase();
        }
        if (correct) score++;
        html += `<tr class="${correct ? 'correct-row' : 'incorrect-row'}"><td>${item.question}</td><td>${userAnswers[i]}</td><td>${correct ? '✔️' : '❌'}</td><td>${item.correct}</td></tr>`;
    });
    html += '</table>';
    document.getElementById("result-area").innerHTML = html;
    let finalScore = (score / questions.length) * 10;

    if (cheatingAttempts >= 2) {
        document.getElementById("score-area").innerHTML = `
            ⛔️ KẾT QUẢ BÀI THI: GIAN LẬN ⛔️<br>
            <div style="font-size: 1.1rem; font-weight: 500; margin-top: 10px;">(Hóa ra bạn giỏi nhất là "Copy Paste" và "Chuyển Tab" 😂)</div>`;
    } else {
        let diem = Math.round(finalScore * 100) / 100;
        let feedback = getFeedback(diem);
        document.getElementById("score-area").innerHTML = `
            <div style="font-size: 2.2rem;">${diem} / 10</div>
            <div style="font-size: 1.1rem; font-weight: 500; margin-top: 10px;">${feedback}</div>
        `;
    }
}

function restartQuiz() {
    document.getElementById("result-section").style.display = "none";
    document.getElementById("upload-section").style.display = "block";
    document.getElementById("file-input").value = "";
    document.getElementById("vocab-table").innerHTML = "";
    document.getElementById("start-btn").style.display = "none";
    cheatingAttempts = 0;
}









// Thêm hàm này vào file JS của bạn
function processAndDownload() {
    const rawInput = document.getElementById("raw-input");
    const rawText = rawInput.value;

    if (!rawText.trim()) {
        showCustomAlert("Vui lòng dán nội dung cần chuyển đổi!");
        return;
    }

    const lines = rawText.split('\n');
    let processedLines = [];

    // Regex giải thích: 
    // ^\s* : Bắt đầu dòng, bỏ qua khoảng trắng
    // (?:           : Nhóm không bắt giữ
    //   \d+[.,)]    : Số kèm dấu chấm, phẩy hoặc ngoặc đơn (1. 1, 1))
    //   |           : HOẶC
    //   [a-zA-Z][.,)] : Một chữ cái kèm dấu chấm, phẩy hoặc ngoặc (a. A, b))
    // )
    // \s* : Bỏ qua khoảng trắng dư thừa sau ký tự đánh số
    const numberingRegex = /^\s*(?:\d+[.,)]|[a-zA-Z][.,)])\s*/;

    lines.forEach(line => {
        let cleanLine = line.trim();
        if (!cleanLine) return;

        // 1. Xóa bỏ ký tự đánh số ở đầu dòng (1., a, 1),...)
        cleanLine = cleanLine.replace(numberingRegex, '');

        if (cleanLine.includes(':')) {
            // 2. Tách phần từ và phần nghĩa
            let [wordPart, ...meaningParts] = cleanLine.split(':');
            let meaning = meaningParts.join(':').trim();

            // 3. Chuẩn hóa phần từ (thay = thành / cho đẹp)
            let cleanWord = wordPart.replace(/=/g, ' / ').trim();

            if (cleanWord && meaning) {
                processedLines.push(`${cleanWord} : ${meaning}`);
            }
        }
    });

    if (processedLines.length === 0) {
        showCustomAlert("Không tìm thấy dữ liệu hợp lệ! Hãy đảm bảo có dấu ':' giữa từ và nghĩa.");
        return;
    }

    const finalResult = processedLines.join('\n');

    // Tự động tải file .txt
    const blob = new Blob([finalResult], { type: 'text/plain' });
    const anchor = document.createElement('a');
    anchor.download = "vocab_cleaned.txt";
    anchor.href = URL.createObjectURL(blob);
    anchor.click();

    // Nạp trực tiếp vào bộ nhớ để học luôn (giữ lại logic cũ của bạn)
    vocabList = processedLines.map(l => {
        let p = l.split(':');
        return { en: p[0].trim(), vn: p[1].trim() };
    });

    showCustomAlert("✨ Đã xóa đánh số & chuẩn hóa thành công!\nBạn có thể nhấn 'Bắt đầu kiểm tra' ngay.");
}

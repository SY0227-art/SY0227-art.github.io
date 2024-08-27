document.addEventListener('DOMContentLoaded', () => {
    const columns = document.querySelectorAll('.column');
    const playButton = document.getElementById('play-button');
    const resetButton = document.getElementById('reset-button');
    const yonabukiCheckbox = document.getElementById('yonabuki');
    const nirobukiCheckbox = document.getElementById('nirobuki');
    const canvas = document.getElementById('line-canvas');
    const ctx = canvas.getContext('2d');
    const selectedNotes = Array(columns.length).fill(null);

    let currentInstrument = 'piano'; // 初期設定はピアノ
    const BPM = 90; // BPMの設定
    const noteDuration = (60 / BPM) * 1000; // 1拍あたりのミリ秒
    let currentAudio = null;

    // canvas のサイズを設定
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawLines(); // サイズ変更後に再描画
    }

    resizeCanvas();

    // 楽器の選択に応じて `currentInstrument` を更新する
    document.querySelectorAll('input[name="instrument"]').forEach(radio => {
        radio.addEventListener('change', () => {
            currentInstrument = document.querySelector('input[name="instrument"]:checked').value;
            updateNoteButtons();
            drawLines();
        });
    });

    // ヨナ抜き音階、ニロ抜き音階のチェックボックスの変更に応じて音階ボタンを更新
    yonabukiCheckbox.addEventListener('change', updateNoteButtons);
    nirobukiCheckbox.addEventListener('change', updateNoteButtons);

    // 各列のボタンにクリックイベントを設定
    columns.forEach((column, columnIndex) => {
        const buttons = column.querySelectorAll('.note-button');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                if (!button.classList.contains('disabled')) {
                    // 音を鳴らす
                    playSound(button.getAttribute('data-note'));

                    // 列内の他のボタンの選択状態を解除
                    buttons.forEach(btn => btn.classList.remove('selected'));

                    // クリックされたボタンを選択状態にする
                    button.classList.add('selected');

                    // 選択されたボタンの座標と要素を保存
                    selectedNotes[columnIndex] = {
                        note: button.getAttribute('data-note'),
                        x: button.getBoundingClientRect().left + button.offsetWidth / 2,
                        y: button.getBoundingClientRect().top + button.offsetHeight / 2,
                        element: button
                    };

                    // 線を描画
                    drawLines();
                }
            });
        });
    });

    // 音を再生する関数
    function playSound(note) {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        currentAudio = new Audio(`${currentInstrument}/${note}.mp3`);
        currentAudio.play();
    }

    // 再生ボタンがクリックされたときの処理
    playButton.addEventListener('click', () => {
        playSequence();
    });

    // リセットボタンがクリックされたときの処理
    resetButton.addEventListener('click', () => {
        resetAll();
    });

    // 選択された音符を順に再生する関数
    function playSequence() {
        let index = 0;

        function playNext() {
            if (index < selectedNotes.length) {
                if (selectedNotes[index]) {
                    const button = selectedNotes[index].element;

                    // 音を再生
                    playSound(selectedNotes[index].note);

                    button.classList.add('playing');

                    // 音の再生が終了した後に次の音を再生
                    setTimeout(() => {
                        button.classList.remove('playing');
                        index++;
                        playNext();
                    }, noteDuration); // BPMに基づいて次の音を再生
                } else {
                    index++;
                    playNext();
                }
            }
        }

        playNext();
    }

    // 音階のボタンを更新する関数
    function updateNoteButtons() {
        const isKoto = currentInstrument === 'koto';
        const yonabuki = yonabukiCheckbox.checked;
        const nirobuki = nirobukiCheckbox.checked;

        columns.forEach(column => {
            const buttons = column.querySelectorAll('.note-button');
            buttons.forEach(button => {
                const note = button.getAttribute('data-note');
                let isDisabled = false;

                if (isKoto) {
                    if (yonabuki && (note === 'F' || note === 'B')) {
                        isDisabled = true;
                    } else if (nirobuki && (note === 'D' || note === 'A')) {
                        isDisabled = true;
                    }
                }

                button.classList.toggle('disabled', isDisabled);
            });
        });
    }

    // 線を描画する関数
    function drawLines() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        selectedNotes.forEach((note, index) => {
            if (note) {
                const nextNote = selectedNotes[index + 1];
                if (nextNote) {
                    ctx.beginPath();
                    ctx.moveTo(note.x, note.y);
                    ctx.lineTo(nextNote.x, nextNote.y);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        });
    }

    // 初期状態にリセットする関数
    function resetAll() {
        selectedNotes.forEach(note => {
            if (note) {
                note.element.classList.remove('selected');
            }
        });
        selectedNotes.fill(null);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // ウィンドウのリサイズに対応
    window.addEventListener('resize', resizeCanvas);
});

document.addEventListener('DOMContentLoaded', () => {
    const analysisForm = document.getElementById('analysisForm');
    const loader = document.getElementById('loader');
    const resultsSection = document.getElementById('results-section');
    
    const mediaOutput = document.getElementById('media-output');
    const ratingOutput = document.getElementById('rating-output');
    const motivationOutput = document.getElementById('motivation-output');
    const suggestionOutput = document.getElementById('suggestion-output');

    analysisForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(analysisForm);
        if (!formData.get('file')?.name) {
            alert('Vui lòng chọn một tệp để phân tích.');
            return;
        }

        resultsSection.style.display = 'none';
        loader.style.display = 'block';
        
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Đã có lỗi xảy ra từ máy chủ.');
            }

            const data = await response.json();
            
            mediaOutput.innerHTML = '';
            const resultPath = data.analysis.output_path;
            
            if (resultPath.match(/\.(mp4|mov|avi|webm)$/i)) {
                const video = document.createElement('video');
                video.src = resultPath;
                video.controls = true;
                video.autoplay = true;
                video.loop = true;
                mediaOutput.appendChild(video);
            } else if (resultPath.match(/\.(jpg|jpeg|png|gif)$/i)) {
                const img = document.createElement('img');
                img.src = resultPath;
                mediaOutput.appendChild(img);
            }

            const analysis = data.analysis;
            ratingOutput.textContent = `${analysis.rating} (${analysis.accuracy}%)`;
            ratingOutput.className = `rating ${analysis.rating_class}`;
            motivationOutput.textContent = analysis.motivation;

            suggestionOutput.innerHTML = '';
            analysis.suggestions.forEach(text => {
                const li = document.createElement('li');
                li.textContent = text;
                suggestionOutput.appendChild(li);
            });

            drawChart(data.history);

            loader.style.display = 'none';
            resultsSection.style.display = 'block';

        } catch (error) {
            loader.style.display = 'none';
            alert('Lỗi: ' + error.message);
            console.error('Fetch error:', error);
        }
    });

    let myChart = null;
    function drawChart(history) {
        const ctx = document.getElementById('accuracyChart').getContext('2d');
        
        const labels = history.map((row, index) => `Lần ${index + 1}`);
        const values = history.map(row => parseFloat(row[2]));

        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tỉ Lệ Đúng (%)',
                    data: values,
                    borderColor: 'rgba(0, 121, 107, 1)',
                    backgroundColor: 'rgba(0, 121, 107, 0.2)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                scales: { y: { beginAtZero: true, max: 100 } },
                responsive: true
            }
        });
    }
});

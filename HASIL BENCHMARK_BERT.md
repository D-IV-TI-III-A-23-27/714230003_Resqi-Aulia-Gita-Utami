# 📊 Benchmark BERT — `bert-base-multilingual-cased`

## Informasi Model

| Parameter | Nilai |
|-----------|-------|
| **Model** | `bert-base-multilingual-cased` |
| **Dimensi Vektor** | 768 |
| **Max Tokens** | 512 |
| **Dukungan Bahasa** | Multi-bahasa (104 bahasa) |
| **Jurnal Uji** | *A new two-phase intrusion detection system with Naïve Bayes machine learning...* |
| **DOI** | `10.1016/j.dajour.2023.100233` |
| **Jumlah Query Uji** | 10 (Factoid, Semantic, Reasoning, Conversational) |
| **Total Waktu Benchmark** | 181.8 detik |

## Hasil Benchmarking

| # | Ukuran Chunk | Overlap | Metode Chunking | Top-K | Hit Rate | Avg Latency | Total Chunks | Avg Chunk Len | Catatan |
|:---:|:---:|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|
| 1 | 500 | 50 | Hybrid | 5 | **70%** | 53.7 ms | 108 | 354 chars | *Chunk kecil, overlap minimal* |
| 2 | 500 | 100 | Hybrid | 5 | **60%** | 52.4 ms | 114 | 356 chars | *Chunk kecil, overlap sedang* |
| 3 | 500 | 100 | Hybrid | 10 | **90%** | 58.2 ms | 114 | 356 chars | *Chunk kecil, Top-K besar* |
| 4 | 1000 | 100 | Hybrid | 5 | **80%** | 69.8 ms | 61 | 651 chars | *Chunk sedang, overlap kecil* |
| 5 | 1000 | 200 | Hybrid | 5 | **80%** | 78.1 ms | 63 | 660 chars | *Default PEDE (baseline)* |
| 6 | 1000 | 200 | Hybrid | 10 | **90%** | 53.2 ms | 63 | 660 chars | *Default + Top-K besar* |
| 7 | 1500 | 200 | Hybrid | 5 | **70%** | 51.1 ms | 46 | 877 chars | *Chunk besar, overlap sedang* |
| 8 | 1500 | 300 | Hybrid | 5 | **80%** | 48.7 ms | 46 | 899 chars | *Chunk besar, overlap besar* |
| 9 | 1800 | 300 | Hybrid | 5 | **80%** | 44.7 ms | 40 | 1013 chars | *Mendekati batas BERT 512 token* |
| 10 | 2000 | 400 | Hybrid | 10 | **100%** | 43.4 ms | 37 | 1084 chars | *Chunk sangat besar, Top-K besar* 🏆 |

## Detail Hit/Miss Per Query

Tabel di bawah menunjukkan apakah setiap query berhasil menemukan chunk yang relevan (✅) atau tidak (❌) untuk setiap konfigurasi.

| Query | Tipe | #1 | #2 | #3 | #4 | #5 | #6 | #7 | #8 | #9 | #10 |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Berapa akurasi yang dicapai pada dataset NSL-... | Factoid | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Apa saja dataset yang digunakan untuk validas... | Factoid | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bagaimana cara kerja fase kedua dari sistem d... | Semantic | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Teknik apa yang dipakai untuk mengatasi masal... | Semantic | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mengapa data dibagi menjadi empat kategori be... | Reasoning | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Apa keunggulan model yang diusulkan dibanding... | Reasoning | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Sistem keamanan IoT untuk mendeteksi serangan... | Semantic | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| gimana cara preprocessing data sebelum klasif... | Conversational | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Berapa akurasi pada dataset CIC-IDS2017? | Factoid | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Jelaskan fungsi Linear Discriminant Analysis ... | Reasoning | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Analisis Hasil

### 🏆 Konfigurasi Terbaik: Config #10

- **Chunk Size:** 2000 karakter
- **Chunk Overlap:** 400 karakter
- **Top-K:** 10
- **Hit Rate:** 100%
- **Avg Latency:** 43.4 ms
- **Catatan:** *Chunk sangat besar, Top-K besar*

### Insight Utama

1. **Chunk Kecil (≤500 chars):** Rata-rata Hit Rate = 73%. Chunk yang lebih kecil berisiko memotong konteks penting, namun menghasilkan embedding yang lebih fokus.
2. **Chunk Sedang (500-1000 chars):** Rata-rata Hit Rate = 83%. Memberikan keseimbangan antara konteks dan presisi.
3. **Chunk Besar (>1000 chars):** Rata-rata Hit Rate = 82%. Chunk yang lebih besar menyimpan lebih banyak konteks namun bisa melampaui batas token BERT (512).
4. **Pengaruh Top-K:** Top-5 rata-rata Hit Rate = 74%, Top-10 rata-rata Hit Rate = 93%. Top-K lebih besar meningkatkan peluang menemukan chunk relevan.

## Panduan Metrik

| Metrik | Definisi | Keterangan |
|--------|----------|------------|
| **Hit Rate** | Persentase query yang berhasil menemukan chunk relevan di Top-K | Semakin tinggi semakin baik. Target minimal 70% |
| **Avg Latency** | Rata-rata waktu pencarian per query (ms) | Di bawah 100ms dianggap baik untuk penggunaan real-time |
| **Total Chunks** | Jumlah chunk yang dihasilkan dari proses chunking | Chunk lebih banyak = pencarian lebih granular |
| **Avg Chunk Len** | Rata-rata panjang karakter per chunk | BERT optimal di ~450 karakter (~100-128 token) |

## Cara Menjalankan Benchmark

```bash
python benchmark_bert.py
```

Script akan otomatis:
1. Membaca PDF dari `papers/`
2. Menguji 10 kombinasi chunking
3. Mengukur Hit Rate, Latency, dan statistik chunk
4. Meng-generate file `BENCHMARK_BERT.md` ini dengan hasil terbaru

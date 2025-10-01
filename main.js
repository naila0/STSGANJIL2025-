// main.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'

import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  setDoc
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCgSS-chZUH5T47nhRNeK6jYDnGZK_TQSA",
  authDomain: "insan-cemerlang-d6eb1.firebaseapp.com",
  projectId: "insan-cemerlang-d6eb1",
  storageBucket: "insan-cemerlang-d6eb1.appspot.com",
  messagingSenderId: "162904381844",
  appId: "1:162904381844:web:dd88782fdcc494c9ac1781",
  measurementId: "G-1RSX6TCWZ2"
};

// inisialisasi firebase
const aplikasi = initializeApp(firebaseConfig)
const basisdata = getFirestore(aplikasi)

// ===== FUNGSI UNTUK MANAJEMEN BARANG/BUAH =====

// fungsi ambil daftar barang 
export async function ambilDaftarBarang() {
  try {
    const refDokumen = collection(basisdata, "barang");
    const kueri = query(refDokumen, orderBy("nama"));
    const cuplikanKueri = await getDocs(kueri);
    
    let hasilKueri = [];
    cuplikanKueri.forEach((dokumen) => {
      hasilKueri.push({
        id: dokumen.id,
        nama: dokumen.data().nama,
        jenis: dokumen.data().jenis,
        harga: dokumen.data().harga,
        stok: dokumen.data().stok,
        tanggalMasuk: dokumen.data().tanggalMasuk
      })
    })
    
    return hasilKueri;
  } catch (error) {
    console.error("Error mengambil daftar barang:", error);
    throw error;
  }
}

// fungsi tambah barang baru
export async function tambahBarang(nama, jenis, harga, stok, tanggalMasuk) {
  try {
    const refDokumen = await addDoc(collection(basisdata, "barang"), {
      nama: nama,
      jenis: jenis,
      harga: harga,
      stok: stok,
      tanggalMasuk: tanggalMasuk
    });
    
    console.log("Barang berhasil ditambahkan dengan ID:", refDokumen.id);
    return refDokumen.id;
  } catch (error) {
    console.error("Error menambah barang:", error);
    throw error;
  }
}

// fungsi edit barang
export async function editBarang(id, nama, jenis, harga, stok, tanggalMasuk) {
  try {
    await updateDoc(doc(basisdata, "barang", id), {
      nama: nama,
      jenis: jenis,
      harga: harga,
      stok: stok,
      tanggalMasuk: tanggalMasuk
    });
    
    console.log("Barang berhasil diupdate");
  } catch (error) {
    console.error("Error mengedit barang:", error);
    throw error;
  }
}

// fungsi hapus barang
export async function hapusBarang(id) {
  try {
    await deleteDoc(doc(basisdata, "barang", id));
    console.log("Barang berhasil dihapus");
  } catch (error) {
    console.error("Error menghapus barang:", error);
    throw error;
  }
}

// fungsi ambil detail barang berdasarkan ID
export async function ambilBarang(id) {
  try {
    const refDokumen = doc(basisdata, "barang", id);
    const snapshotDokumen = await getDoc(refDokumen);
    
    if (snapshotDokumen.exists()) {
      return {
        id: snapshotDokumen.id,
        nama: snapshotDokumen.data().nama,
        jenis: snapshotDokumen.data().jenis,
        harga: snapshotDokumen.data().harga,
        stok: snapshotDokumen.data().stok,
        tanggalMasuk: snapshotDokumen.data().tanggalMasuk
      };
    } else {
      throw new Error("Barang tidak ditemukan");
    }
  } catch (error) {
    console.error("Error mengambil barang:", error);
    throw error;
  }
}

// ===== FUNGSI UNTUK MANAJEMEN PENJUALAN =====

// Menambah barang ke keranjang/transaksi
export async function tambahBarangKeKeranjang(
  idbarang,
  nama,
  harga,
  jumlah,
  idpelanggan,
  namapelanggan
) {
  try {
    // periksa apakah idbarang sudah ada di collection transaksi?
    let refDokumen = collection(basisdata, "transaksi")
    
    // membuat query untuk mencari data berdasarkan idbarang dan idpelanggan
    let queryBarang = query(refDokumen, 
      where("idbarang", "==", idbarang),
      where("idpelanggan", "==", idpelanggan)
    )
    
    let snapshotBarang = await getDocs(queryBarang)
    let jumlahRecord = 0
    let idtransaksi = ''
    let jumlahSebelumnya = 0
    
    snapshotBarang.forEach((dokumen) => {
      jumlahRecord++
      idtransaksi = dokumen.id
      jumlahSebelumnya = dokumen.data().jumlah
    })
    
    if (jumlahRecord == 0) {
      // kalau belum ada, tambahkan langsung ke collection
      const refDokumen = await addDoc(collection(basisdata, "transaksi"), {
        idbarang: idbarang,
        nama: nama,
        harga: harga,
        jumlah: jumlah,
        idpelanggan: idpelanggan,
        namapelanggan: namapelanggan,
        tanggal: new Date().toISOString().split('T')[0] // tanggal hari ini
      })
      console.log("Transaksi baru berhasil dibuat dengan ID:", refDokumen.id)
    } else if (jumlahRecord == 1) {
      // kalau sudah ada, tambahkan jumlahnya saja
      const jumlahBaru = parseInt(jumlahSebelumnya) + parseInt(jumlah)
      await updateDoc(doc(basisdata, "transaksi", idtransaksi), { 
        jumlah: jumlahBaru 
      })
      console.log("Jumlah transaksi diperbarui")
    }
    
    // Kurangi stok barang
    const barang = await ambilBarang(idbarang)
    const stokBaru = parseFloat(barang.stok) - parseFloat(jumlah)
    await updateDoc(doc(basisdata, "barang", idbarang), { 
      stok: stokBaru 
    })
    
    return true;
  } catch (error) {
    console.error("Error menambah barang ke keranjang:", error)
    throw error
  }
}

// menampilkan barang di keranjang/transaksi
export async function ambilDaftarBarangDiKeranjang() {
  try {
    const refDokumen = collection(basisdata, "transaksi");
    const kueri = query(refDokumen, orderBy("tanggal", "desc"));
    const cuplikanKueri = await getDocs(kueri);
    
    let hasilKueri = [];
    cuplikanKueri.forEach((dokumen) => {
      hasilKueri.push({
        id: dokumen.id,
        idbarang: dokumen.data().idbarang,
        nama: dokumen.data().nama,
        jumlah: dokumen.data().jumlah,
        harga: dokumen.data().harga,
        idpelanggan: dokumen.data().idpelanggan,
        namapelanggan: dokumen.data().namapelanggan,
        tanggal: dokumen.data().tanggal
      })
    })
    return hasilKueri;
  } catch (error) {
    console.error("Error mengambil daftar barang di keranjang:", error);
    throw error;
  }
}

// hapus barang dari keranjang/transaksi
export async function hapusBarangDariKeranjang(id) {
  try {
    // Ambil data transaksi sebelum dihapus untuk mengembalikan stok
    const transaksiDoc = await getDoc(doc(basisdata, "transaksi", id));
    if (transaksiDoc.exists()) {
      const transaksi = transaksiDoc.data();
      
      // Kembalikan stok barang
      const barang = await ambilBarang(transaksi.idbarang);
      const stokBaru = parseFloat(barang.stok) + parseFloat(transaksi.jumlah);
      await updateDoc(doc(basisdata, "barang", transaksi.idbarang), {
        stok: stokBaru
      });
    }
    
    // Hapus transaksi
    await deleteDoc(doc(basisdata, "transaksi", id));
    console.log("Barang berhasil dihapus dari keranjang");
  } catch (error) {
    console.error("Error menghapus barang dari keranjang:", error);
    throw error;
  }
}

// update transaksi/penjualan
export async function updateTransaksi(id, jumlah, harga) {
  try {
    // Ambil data transaksi lama untuk perhitungan stok
    const transaksiLama = await getDoc(doc(basisdata, "transaksi", id));
    
    if (transaksiLama.exists()) {
      const dataLama = transaksiLama.data();
      const selisihJumlah = parseFloat(jumlah) - parseFloat(dataLama.jumlah);
      
      // Update stok barang
      const barang = await ambilBarang(dataLama.idbarang);
      const stokBaru = parseFloat(barang.stok) - selisihJumlah;
      await updateDoc(doc(basisdata, "barang", dataLama.idbarang), {
        stok: stokBaru
      });
    }
    
    // Update transaksi
    await updateDoc(doc(basisdata, "transaksi", id), {
      jumlah: jumlah,
      harga: harga
    });
    
    console.log("Transaksi berhasil diupdate");
  } catch (error) {
    console.error("Error mengupdate transaksi:", error);
    throw error;
  }
}

// ===== FUNGSI UNTUK MANAJEMEN PELANGGAN =====

// fungsi ambil daftar pelanggan
export async function ambilDaftarPelanggan() {
  try {
    const refDokumen = collection(basisdata, "pelanggan");
    const kueri = query(refDokumen, orderBy("nama"));
    const cuplikanKueri = await getDocs(kueri);
    
    let hasilKueri = [];
    cuplikanKueri.forEach((dokumen) => {
      hasilKueri.push({
        id: dokumen.id,
        nama: dokumen.data().nama,
        alamat: dokumen.data().alamat,
        nohape: dokumen.data().nohape
      })
    })
    
    return hasilKueri;
  } catch (error) {
    console.error("Error mengambil daftar pelanggan:", error);
    throw error;
  }
}

// fungsi tambah pelanggan baru
export async function tambahPelanggan(nama, alamat, nohape) {
  try {
    const refDokumen = await addDoc(collection(basisdata, "pelanggan"), {
      nama: nama,
      alamat: alamat,
      nohape: nohape
    });
    
    console.log("Pelanggan berhasil ditambahkan dengan ID:", refDokumen.id);
    return refDokumen.id;
  } catch (error) {
    console.error("Error menambah pelanggan:", error);
    throw error;
  }
}

// fungsi edit pelanggan
export async function editPelanggan(id, nama, alamat, nohape) {
  try {
    await updateDoc(doc(basisdata, "pelanggan", id), {
      nama: nama,
      alamat: alamat,
      nohape: nohape
    });
    
    console.log("Pelanggan berhasil diupdate");
  } catch (error) {
    console.error("Error mengedit pelanggan:", error);
    throw error;
  }
}

// fungsi hapus pelanggan
export async function hapusPelanggan(id) {
  try {
    await deleteDoc(doc(basisdata, "pelanggan", id));
    console.log("Pelanggan berhasil dihapus");
  } catch (error) {
    console.error("Error menghapus pelanggan:", error);
    throw error;
  }
}

// fungsi ambil detail pelanggan berdasarkan ID
export async function ambilPelanggan(id) {
  try {
    const refDokumen = doc(basisdata, "pelanggan", id);
    const snapshotDokumen = await getDoc(refDokumen);
    
    if (snapshotDokumen.exists()) {
      return {
        id: snapshotDokumen.id,
        nama: snapshotDokumen.data().nama,
        alamat: snapshotDokumen.data().alamat,
        nohape: snapshotDokumen.data().nohape
      };
    } else {
      throw new Error("Pelanggan tidak ditemukan");
    }
  } catch (error) {
    console.error("Error mengambil pelanggan:", error);
    throw error;
  }
}

// ===== FUNGSI TAMBAHAN UNTUK FITUR LAINNYA =====

export async function ambilBarangProsesDiKeranjang() {
  try {
    let refDokumen = collection(basisdata, "transaksi")
    
    // membuat query untuk mencari data yg masih proses 
    let queryBarangProses = query(refDokumen, where("idpelanggan", "==", "proses"))
    
    let snapshotBarang = await getDocs(queryBarangProses)
    let hasilKueri = []
    snapshotBarang.forEach((dokumen) => {
      hasilKueri.push({
        id: dokumen.id,
        nama: dokumen.data().nama,
        jumlah: dokumen.data().jumlah,
        harga: dokumen.data().harga,
        idpelanggan: dokumen.data().idpelanggan,
        namapelanggan: dokumen.data().namapelanggan
      })
    })
    return hasilKueri
  } catch (error) {
    console.error("Error mengambil barang proses di keranjang:", error);
    throw error;
  }
}

export async function ubahBarangProsesDikeranjang(id, idpelanggan, namapelanggan) {
  try {
    await updateDoc(doc(basisdata, "transaksi", id), { 
      idpelanggan: idpelanggan, 
      namapelanggan: namapelanggan 
    })
    console.log("Barang proses berhasil diubah")
  } catch (error) {
    console.error("Error mengubah barang proses di keranjang:", error);
    throw error;
  }
}

export async function daftarBarangNotaPelanggan(idpelanggan) {
  try {
    let refDokumen = collection(basisdata, "transaksi")
    
    // membuat query untuk mencari data pelanggan tertentu 
    let queryBarangPelanggan = query(refDokumen, where("idpelanggan", "==", idpelanggan))
    
    let snapshotBarang = await getDocs(queryBarangPelanggan)
    let hasilKueri = []
    snapshotBarang.forEach((dokumen) => {
      hasilKueri.push({
        id: dokumen.id,
        nama: dokumen.data().nama,
        jumlah: dokumen.data().jumlah,
        harga: dokumen.data().harga,
        idpelanggan: dokumen.data().idpelanggan,
        namapelanggan: dokumen.data().namapelanggan,
        tanggal: dokumen.data().tanggal
      })
    })
    return hasilKueri
  } catch (error) {
    console.error("Error mengambil daftar barang nota pelanggan:", error);
    throw error;
  }
}

// fungsi untuk mendapatkan statistik penjualan hari ini
export async function ambilStatistikHariIni() {
  try {
    const tanggalHariIni = new Date().toISOString().split('T')[0];
    let refDokumen = collection(basisdata, "transaksi");
    
    // query untuk transaksi hari ini
    let queryHariIni = query(
      refDokumen, 
      where("tanggal", "==", tanggalHariIni)
    );
    
    let snapshotHariIni = await getDocs(queryHariIni);
    let totalPenjualan = 0;
    let totalTransaksi = 0;
    
    snapshotHariIni.forEach((dokumen) => {
      const data = dokumen.data();
      totalPenjualan += parseFloat(data.jumlah) * parseFloat(data.harga);
      totalTransaksi++;
    });
    
    return {
      totalPenjualan: totalPenjualan,
      totalTransaksi: totalTransaksi
    };
  } catch (error) {
    console.error("Error mengambil statistik hari ini:", error);
    throw error;
  }
}

// fungsi inisialisasi data contoh (untuk testing)
export async function inisialisasiDataContoh() {
  try {
    // Cek apakah sudah ada data
    const daftarBarang = await ambilDaftarBarang();
    if (daftarBarang.length > 0) {
      console.log("Data sudah ada, tidak perlu inisialisasi");
      return;
    }
    
    // Tambah data contoh barang
    const barangContoh = [
      { nama: "Apel", jenis: "Impor", harga: 25000, stok: 50, tanggalMasuk: "2023-10-01" },
      { nama: "Jeruk", jenis: "Lokal", harga: 15000, stok: 30, tanggalMasuk: "2023-10-05" },
      { nama: "Mangga", jenis: "Lokal", harga: 20000, stok: 25, tanggalMasuk: "2023-10-10" },
      { nama: "Anggur", jenis: "Impor", harga: 35000, stok: 15, tanggalMasuk: "2023-10-15" },
      { nama: "Pisang", jenis: "Lokal", harga: 12000, stok: 40, tanggalMasuk: "2023-10-12" }
    ];
    
    for (const barang of barangContoh) {
      await tambahBarang(
        barang.nama, 
        barang.jenis, 
        barang.harga, 
        barang.stok, 
        barang.tanggalMasuk
      );
    }
    
    // Tambah data contoh pelanggan
    const pelangganContoh = [
      { nama: "Aulia", alamat: "Jl.Pasir Maung No. 123, Bogor", nohape: "081234567890" },
      { nama: "Elzan", alamat: "Jl. Sentul No. 45, Bogor", nohape: "082345678901" },
      { nama: "Naila", alamat: "Jl.Landeuh No. 67, Babakanmadang", nohape: "0882-1390-1218" }
    ];
    
    for (const pelanggan of pelangganContoh) {
      await tambahPelanggan(
        pelanggan.nama,
        pelanggan.alamat,
        pelanggan.nohape
      );
    }
    
    console.log("Data contoh berhasil diinisialisasi");
  } catch (error) {
    console.error("Error inisialisasi data contoh:", error);
    throw error;
  }
}
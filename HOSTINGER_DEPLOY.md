# Hostinger Quraşdırma Təlimatı (Step-by-Step)

Bu layihə **Hostinger Cloud / VPS** və ya **Hostinger Business Web Hosting (Node.js App dəstəkli)** üçün xüsusi olaraq optimallaşdırılmışdır.

---

### Seçim A: Hostinger hPanel "Node.js" Bölməsi ilə (Shared / Cloud Hosting)
1. **Hostinger hPanel**-ə daxil olun.
2. Sol menyudan **"Advanced" -> "Node.js"** seçin.
3. **"Create Application"** düyməsini sıxın:
   - **Node.js version**: 18.x və ya 20.x seçin.
   - **Application root**: `public_html` və ya `saytadi` qovluğu.
   - **Application startup file**: `server.js` qeyd edin.
4. Bu ZIP-in içindəki bütün faylları hPanel **"File Manager"** vasitəsilə həmin qovluğa yükləyin və ZIP-i çıxarın (Extract).
5. `.env.example` faylının adını `.env` edin və verilənlər bazası linkinizi qeyd edin.
6. **"Run npm install"** və sonra **"Run build"** düyməsini sıxın.
7. Saytınız aktivdir!

---

### Seçim B: Hostinger VPS (Ubuntu 22.04 / 24.04 + PM2)
```bash
# 1. Reponu və ya ZIP-i serverə köçürün
cd /var/www/saytadi

# 2. Paketləri quraşdırın
npm install

# 3. Prisma bazasını yaradın
npx prisma migrate dev --name init
npm run seed

# 4. İstehsal üçün build edin
npm run build

# 5. PM2 ilə daimi fonda işə salın
pm2 start server.js --name "saytadi-platform"
pm2 save
pm2 startup
```

---

### Verilənlər Bazası Seçimi (Database):
* **Hostinger MySQL / PostgreSQL**: Hostinger panelindən pulsuz PostgreSQL və ya MySQL yaradıb `DATABASE_URL` hissəsinə yaza bilərsiniz.
* **Serverless PostgreSQL (Tövsiyə olunur)**: Neon.tech və ya Supabase pulsuz PostgreSQL linkinizi `.env` faylına yapışdırmağınız kifayətdir!

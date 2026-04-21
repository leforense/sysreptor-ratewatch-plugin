# RateWatch — SysReptor Plugin

A SysReptor plugin that provides a visual dashboard for analyzing Burp Suite Intruder CSV exports — detect Rate Limiting behavior, WAF blocks, throttling patterns, and response anomalies at a glance.

## Features

- **Automatic CSV parsing** — supports Burp Suite Intruder tab-separated exports
- **RPS Gauge** — visual throughput meter (requests per second)
- **Response Integrity chart** — breakdown of all status codes (2xx, 3xx, 4xx, 5xx)
- **Latency time-series chart** — per-request response time colored by status code
- **Error & Timeout detection** — counts HTTP 5xx errors and 504 timeouts
- **Dashboard export** — download the full dashboard as a PNG image

## Plugin ID

`83d78a81-0950-4eef-ae14-d5ebacdf2cb4`

## Stack

- **Backend**: Django (SysReptor plugin system)
- **Frontend**: React 19 + TypeScript, Vite, Tailwind CSS, Recharts, html2canvas

## Installation (SysReptor)

1. Clone the repository directly into your SysReptor `plugins/` folder:
   ```bash
   git clone https://github.com/leforense/sysreptor-ratewatch-plugin.git /path/to/sysreptor/plugins/ratewatchplugin
   ```

2. Build the frontend:
   ```bash
   cd /path/to/sysreptor/plugins/ratewatchplugin/frontend
   npm install
   npm run build
   ```
   This outputs static files to `plugins/ratewatchplugin/static/`.

3. Create a `docker-compose.override.yml` in your SysReptor `deploy/` folder to mount the plugins directory into the container:
   ```yaml
   services:
     app:
       volumes:
         - type: bind
           source: ./plugins
           target: /app/plugins
           read_only: true
   ```

4. Add the plugin to your SysReptor `ENABLED_PLUGINS` setting in `app.env`:
   ```
   ENABLED_PLUGINS=ratewatchplugin
   ```

5. Restart SysReptor. The **RateWatch** entry will appear in the main menu.

## Frontend Development

```bash
cd frontend
npm install
npm run dev   # dev server at http://localhost:3000
npm run build # production build → ../static/
```

## How to Export from Burp Suite

1. Run an **Intruder** attack in Burp Suite.
2. After the attack, right-click the results table → **Save results** → **Select all Columns** → **CSV**.
3. Upload the `.csv` file to the RateWatch dashboard.

## License

Released into the public domain under the [Unlicense](LICENSE). No attribution required.

## Demo

Exporting:

<img width="1318" height="922" alt="ratewatch" src="https://github.com/user-attachments/assets/949558ba-f98c-4c5c-a4c6-1a1505d0b501" />


Importing:

<img width="1722" height="1284" alt="ratewatch-plugin" src="https://github.com/user-attachments/assets/fc1ba520-20f5-420e-a52c-d0f407e30174" />




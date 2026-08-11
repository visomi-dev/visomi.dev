# Mi escritorio es mi hogar digital — y lo construi asi

*Un entorno Arch Linux + Sway tematicamente coherente con Catppuccin Latte.
Sin concesiones, sin distracciones.*

---

Pasamos entre 8 y 14 horas al dia frente a una pantalla. Para mi, eso convierte
al escritorio en el equivalente digital de una casa: si voy a habitar este
espacio todo el dia, mas vale que sea acogedor, consistente y no me fatigue la
vista a la tercera hora. No se trata solo de productividad — se trata de
bienestar.

Esta es la bitacora de como termine con un setup donde cada pixel sigue la
misma paleta de colores, por que elegi cada pieza, y como vos podes replicarlo
(o adaptarlo) si compartis la obsesion por la coherencia visual.

---

## La paleta: Catppuccin Latte + Mauve

Descubri [Catppuccin](https://github.com/catppuccin/catppuccin) hace un par de
anos y nunca mas solte el tema. Es un theme comunitario con 4 flavors (Latte,
Frappe, Macchiato, Mocha) y 26 colores cada uno. La propuesta: un punto medio
entre temas de bajo y alto contraste. Para alguien que escribe codigo 12 horas,
eso es oro.

Elegi **Latte** como flavor base. Es claro, calido, legible bajo luz natural y
artificial. No cansa. Cero fatiga visual incluso en sesiones largas. Y como
acento: **Mauve** (`#8839ef`), un purpura visible pero no agresivo que recorre
bordes, cursores, highlights, botones, y prompts desde el login hasta el
apagado.

El resultado es un escritorio que se siente como una extension de mi cabeza:
ordenado, predecible, sin ruido visual.

---

## La base: Arch + Sway

Siempre fui de Arch Linux. Rolling release, AUR, control total. No hay magia
negra que no entienda porque todo lo configure yo. Y sobre Arch corre
**Sway**, un compositor de ventanas tipo tiling nativo de Wayland.

Sway no es bonito por defecto. Es austero. Pero justamente eso lo hace el
lienzo perfecto: le das una paleta de colores y cobra vida. Mis workspaces
tienen nombres funcionales: `core`, `net`, `code`, `media`, `ops` — cada uno
atado a un monitor. Tipografia JetBrains Mono a 13pt. Bordes de 2px. Gaps de
8px internos y 4px externos. Nada sobra.

Encima de Sway corre **Waybar**, una barra superior con un reloj que no da la
hora como cualquier barra — da la hora como si estuvieras en Matrix:
`"MATRIX ONLINE | %a %Y-%m-%d %H:%M:%S"`. Porque si vamos a personalizar, que
tenga personalidad.

Las notificaciones las gestiona **SwayNC**, un centro de notificaciones
completo con controles MPRIS de medios, volumen, brillo, y modo no molestar.
Reemplaza al viejo Mako con esteroides.

Y para no perder jamas la coherencia visual: **Wofi** como launcher (drun, con
previsualizacion de iconos), **Swaylock** como pantalla de bloqueo con colores
Latte, **wlogout** como menu de apagado con bordes Mauve, y **Swayidle** para
bloquear automaticamente tras inactividad.

---

## Del login al prompt: cada pantalla tiene su tema

El gestor de inicio de sesion es **Greetd** con **tuigreet**. Es un greeter
minimalista en modo texto. Le pase los hex de Latte directamente en
`/etc/greetd/config.toml` — bordes en Mauve, texto en el color `text` de la
paleta, campo de entrada en `surface0`. No hay puerto oficial de Catppuccin
para greetd, pero con 8 colores bien puestos alcanza para que no desentone.

Al abrir terminal, **Ghostty** me recibe con el tema Catppuccin Latte oficial.
Es una terminal con aceleracion GPU, nativa de Wayland, que carga el esquema de
colores completo: fondo `#eff1f5`, texto `#4c4f69`, cursor color Rosewater
(`#dc8a78`).

Y antes del primer prompt, **Fastfetch** imprime la info del sistema con una
configuracion que rota los colores de la paleta Latte por cada modulo — OS en
rojo, kernel en amarillo, paquetes en verde, shell en cyan, WM en magenta,
terminal en azul. Un saludo visual consistente cada vez que abro una ventana.

---

## El entorno de desarrollo: coherencia entre herramientas

Trabajo con TypeScript, Angular, Node.js, Python, Nx monorepos, y
arquitecturas de microfrontends. Cambio de contexto docenas de veces al dia. Si
cada herramienta tuviera su propio esquema de colores, mi cerebro gastaria
energia en adaptarse en lugar de resolver problemas.

Por eso todo — repito, todo — esta tematicamente alineado.

### Editores

**Neovim** es mi editor principal. Corre con lazy.nvim, el plugin
`catppuccin/nvim`, Treesitter, LSP completo (TypeScript, Python, Lua, HTML,
CSS, JSON, Bash), Telescope, Neo-tree, Lualine, Gitsigns, y autocompletado con
nvim-cmp. Una experiencia de IDE, pero en la terminal.

Para ediciones rapidas o cuando ya tengo una ventana abierta, **Vim** con
`catppuccin/vim` y un `.vimrc` minimalista. Y cuando necesito debuggear o
previsualizar en GUI, **VSCode** con la extension oficial de Catppuccin.

### Terminal toolbox

Cada herramienta CLI que reemplaza a una clasica esta tematicamente configurada:

- `bat` en lugar de `cat` — sintaxis coloreada con el tema Latte
- `eza` en lugar de `ls` — alias `ls`, `ll`, `la`, `lt`, `tree`, con iconos
  Nerd Font y colores Mauve para directorios
- `yazi` en lugar de gestores de archivos GUI — navegacion con iconos, vista
  previa, y tema Mauve
- `delta` como pager de `git diff` — colores Latte para adiciones, remociones,
  y encabezados
- `lazygit` como cliente Git TUI — bordes Mauve, opciones azules
- `zellij` como multiplexor de terminal (en vez de tmux) — con el tema Latte
- `btop` como monitor de recursos — reemplazo digno de htop
- `cava` como visualizador de audio en la terminal — gradiente desde Teal hasta
  Red sobre fondo Latte

### Shell y prompt

**Zsh** con antigen como plugin manager. **Starship** con la paleta completa de
Catppuccin Latte. **Zsh syntax highlighting** con un archivo de colores
personalizado que sigue la paleta. **Fzf** con un esquema Latte aplicado via
variables de entorno.

### Librerias para proyectos

Para cuando el codigo necesita acceso programatico a la paleta:

- `@catppuccin/palette` en TypeScript — `import { flavors } from
  '@catppuccin/palette'` da acceso a hex, RGB y HSL de cada color
- `catppuccin` en Python — `plt.style.use(ctp.PALETTE.latte.identifier)` para
  graficos Matplotlib, mas acceso directo a colores individuales

---

## La web tambien es parte del escritorio

No tiene sentido que mi escritorio sea Latte y despues YouTube sea negro
absoluto. Para eso uso **Stylus** con CSP patching habilitado y la coleccion de
[Catppuccin Userstyles](https://github.com/catppuccin/userstyles).

Sitios que tengo tematicamente adaptados:

YouTube, YouTube Music, GitHub, Discord, DuckDuckGo, Startpage, DeepL, Hacker
News, Codeberg, Twitch, ChatGPT, Spotify Web, MDN, Arch Wiki, y unos 120 sitios
mas disponibles en la coleccion.

Para **Discord** uso **BetterDiscord** en lugar de Stylus porque Discord
bloquea CSS externo. El tema se importa desde el CDN oficial:
`catppuccin-latte-mauve.theme.css`.

Para **YouTube Music** pase de la PWA a **ytmdesktop**, el cliente de
escritorio nativo. Arranca automaticamente con Sway y carga el CSS de Latte
directamente desde `~/.config/ytmdesktop/catppuccin-latte.css`.

---

## Media, gaming y sistema

- **mpv** como reproductor de video con fondo Latte y UI en Mauve
- **Zathura** como lector de PDFs con colores Latte
- **OBS Studio** con el tema Catppuccin completo (flavor Latte desde el
  selector de apariencia)
- **imv** como visor de imagenes nativo de Wayland con fondo Latte
- **MangoHud** como overlay de rendimiento para gaming con colores Latte

A nivel sistema:

- **GTK 3 y 4** con `catppuccin-latte-mauve-standard+default` desde AUR
- **Cursores** `catppuccin-latte-dark-cursors` desde AUR, tamano 24px
- **Iconos Papirus** con carpetas Catppuccin (`papirus-folders-catppuccin-git`)
- **TTY** con colores de consola Latte (pendiente de aplicar via kernel cmdline
  para que sea permanente)
- **Bootloader** systemd-boot (sin puerto Catppuccin; rEFInd es la alternativa
  recomendada)

---

## Lo que falta

Algunas piezas quedan pendientes, ya sea porque requieren sesion grafica para
configurarse o porque son plataformas propietarias:

- **Firefox** y **Brave** — `catppuccin/firefox` y `catppuccin/chrome`,
  respectivamente
- **Telegram Desktop** — `catppuccin/telegram` via archivo de paleta
- **JupyterLab** — `jupyterlab-catppuccin` desde AUR (requiere `pipx install
  jupyterlab`)
- **Plymouth** — splash de arranque con tema Latte (no uso GRUB, systemd-boot
  no tiene puerto)

---

## Por que escribi esto

Porque cada vez que alguien me pregunta "que tema usas?" o "como tenes tan
ordenado el escritorio?", termino enviando una lista interminable de mensajes.
Ahora puedo mandar un link.

Y porque creo que la coherencia visual importa. No es superficial: es
accesibilidad, es enfoque, es respeto por uno mismo como usuario avanzado. Si
vas a pasar 50 horas semanales frente a una pantalla, que sea una que te haga
sentir bien.

Todo el credito a la comunidad de [Catppuccin](https://github.com/catppuccin) —
un proyecto open source mantenido por cientos de personas que entienden que el
software puede ser funcional y hermoso al mismo tiempo.

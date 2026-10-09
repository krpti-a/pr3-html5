export default async function ({ open, until, shot, sleep }) {
  await open('/');
  await until(`__h.texts().some(t => /online\\)/.test(t))`, 20000, 'menu');
  await sleep(1500); await shot('port-menu');
}

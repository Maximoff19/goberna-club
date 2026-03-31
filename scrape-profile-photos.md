# Prompt: Descargar fotos de perfil de consultores y asignarlas en el servidor

## Contexto

Estas son las fotos de perfil de los consultores de Club Goberna, scrapeadas de `goberna.pe/busco-un-consultor/`. Solo se incluyen los que ya existen en nuestra base de datos.

## Instrucciones

1. Descargá cada imagen de la columna "Foto de perfil (URL origen)"
2. Convertila a `.webp` usando `sharp`
3. Guardala en `backend/generated/profile-assets/` con un nombre basado en el slug
4. Creá el registro en la tabla `ProfileMediaAsset` con type `AVATAR`
5. Actualizá el campo `avatarUrl` del `User` dueño de ese perfil con la URL pública `/generated/profile-assets/{filename}.webp`
6. Los 2 consultores marcados como "No encontrado en goberna.pe" no tienen foto disponible, ignoralos

## Consultores con fotos encontradas

| # | Nombre | Slug en DB | Foto de perfil (URL origen) |
|---|--------|------------|----------------------------|
| 1 | Andrés Gustavo Morales Godoy | `andres-gustavo-morales-godoy` | https://goberna.pe/wp-content/uploads/2023/03/agustavo.png |
| 2 | Miguel Angel Martín López | `miguel-angel-martin-lopez` | https://goberna.pe/wp-content/uploads/2023/03/Miguel-Angel-Martin-Lopez.jpg |
| 3 | Angel Alberto Izquierdo Inoa | `angel-alberto-izquierdo-inoa` | https://goberna.pe/wp-content/uploads/2023/03/image2-1.jpeg |
| 4 | Jorge Luis Pérez Morocho | `jorge-luis-perez-morocho` | https://goberna.pe/wp-content/uploads/2022/10/Jorge-Luis-Perez.jpg |
| 5 | Félix Wilmer Paguay Chávez | `felix-wilmer-paguay-chavez` | https://goberna.pe/wp-content/uploads/2022/10/Felix.jpg |
| 6 | Julio César Monteverde Chirinos | `julio-cesar-monteverde-chirinos` | https://goberna.pe/wp-content/uploads/2022/01/Jose-foto-ric.jpg |
| 7 | Ulises Alexander Carofilis Moreira | `ulises-alexander-carofilis-moreira` | https://goberna.pe/wp-content/uploads/2021/10/RIC-Ulises.jpg |
| 8 | Deiby Mauricio Ochoa Pineda | `deiby-mauricio-ochoa-pineda` | https://goberna.pe/wp-content/uploads/2021/10/RIC-Deiby1.jpg |
| 9 | Ericka Yomara Hernández Agustín | `ericka-yomara-hernandez-agustin` | https://goberna.pe/wp-content/uploads/2021/10/RIC-Ericka.jpg |
| 10 | Lisbett Marizol Reyna Romero | `lisbett-marizol-reyna-romero` | https://goberna.pe/wp-content/uploads/2021/10/RIC-Marizol.jpg |
| 11 | Jhonatan Josué Araniva Valladares | `jhonatan-josue-araniva-valladares` | https://goberna.pe/wp-content/uploads/2021/01/Sin-titulo-1.jpg |
| 12 | Mario Alberto Romero Inzunza | `mario-alberto-romero-inzunza` | https://goberna.pe/wp-content/uploads/2020/11/Mario-Alberto-Romero-Inzunza.jpg |
| 13 | Osvaldo Villalobos Corante | `osvaldo-villalobos-corante` | https://goberna.pe/wp-content/uploads/2021/02/osvaldo-ric2.jpg |
| 14 | Christian René Martínez Trejo | `christian-rene-martinez-trejo` | https://goberna.pe/wp-content/uploads/2021/10/RIC-Christian-Martinez.jpg |
| 15 | Gabriel Martínez Guerra | `gabriel-martinez-guerra` | https://goberna.pe/wp-content/uploads/2021/05/Gabriel-ric-5.jpg |
| 16 | José Antonio Artola Suárez | `jose-antonio-artola-suarez` | https://goberna.pe/wp-content/uploads/2020/09/Jose-Artola-Suarez-RIC.jpg |
| 17 | Richard Gustavo Maldonado Valencia | `richard-gustavo-maldonado-valencia` | https://goberna.pe/wp-content/uploads/2021/10/RIC-RICHARD.jpg |
| 18 | Yahaira Lineth Perén González | `yahaira-lineth-peren-gonzalez` | https://goberna.pe/wp-content/uploads/2021/10/RIC-Yajaira.jpg |
| 19 | Bryan Quan Motta | `bryan-quan-motta` | https://goberna.pe/wp-content/uploads/2021/10/RIC-Bryan.jpg |
| 20 | Azael Josué Márquez Pérez | `azael-josue-marquez-perez` | https://goberna.pe/wp-content/uploads/2021/10/RIC-Josue1.jpg |
| 21 | Leonor Miroslava Fernández Guevara | `leonor-miroslava-fernandez-guevara` | https://goberna.pe/wp-content/uploads/2021/06/Miroslava-Fernandez.jpg |
| 22 | José Asunción Villalobos Guerra | `jose-asuncion-villalobos-guerra` | https://goberna.pe/wp-content/uploads/2021/06/JVGZ.png |
| 23 | Ricardo Ernesto Estrada Hernández | `ricardo-ernesto-estrada-hernandez` | https://goberna.pe/wp-content/uploads/2021/10/RIC-Ricardo.jpg |

## Consultores en goberna.pe que NO están en nuestra DB (crear perfil si se requiere)

| Nombre | URL en goberna.pe | Foto de perfil (URL origen) |
|--------|-------------------|----------------------------|
| Mónika Ruiz Rojas | https://goberna.pe/consultores/monika-ruiz-rojas/ | https://goberna.pe/wp-content/uploads/2021/05/Monika-ric1.jpg |
| Jonathan Xavier Salazar Erazo | https://goberna.pe/consultores/jonathan-xavier-salazar-erazo/ | https://goberna.pe/wp-content/uploads/2021/05/Jonathan-ric.jpg |
| Wendy Guadalupe Villalba | https://goberna.pe/consultores/wendy-guadalupe-villalba/ | https://goberna.pe/wp-content/uploads/2021/05/Wendy-ric.jpg |
| Hernando Sánchez Blanco | https://goberna.pe/consultores/hernando-sanchez-blanco/ | https://goberna.pe/wp-content/uploads/2021/05/Hernando-ric.jpg |
| José Conde Merma | https://goberna.pe/consultores/jose-conde-merma/ | https://goberna.pe/wp-content/uploads/2020/09/Jose-Conde-Merma.jpg |
| Roy Igor Estrada Calderón | https://goberna.pe/consultores/roy-igor-estrada-calderon/ | https://goberna.pe/wp-content/uploads/2020/09/Roy-Igor-Estrada-Calderon.jpg |
| Natalia Flores Delgadillo | https://goberna.pe/consultores/natalia-flores-delgadillo/ | https://goberna.pe/wp-content/uploads/2020/09/Natalia-Flores-Delgadillo.jpg |
| Patricio Javier Montecinos Galaz | https://goberna.pe/consultores/patricio-javier-montecinos-galaz/ | https://goberna.pe/wp-content/uploads/2020/08/Patricio-Montecinos-Galaz.jpg |

## Consultores SIN foto en goberna.pe

| Nombre | Slug en DB |
|--------|------------|
| Rubén Paul Almengor Urriola | `ruben-paul-almengor-urriola` |

## Notas técnicas

- El backend ya tiene el servicio de upload en `backend/src/modules/profile-assets/profile-assets.service.ts`
- Las imágenes se sirven desde `http://localhost:4000/generated/profile-assets/`
- La conversión a webp usa `sharp` con quality 80 y max 320px para avatares
- La tabla `ProfileMediaAsset` ya tiene los campos: `storageKey`, `mimeType`, `sizeBytes`, `publicUrl`, `type` (usar `AVATAR`)
- Hacer soft-delete de avatares anteriores antes de insertar los nuevos

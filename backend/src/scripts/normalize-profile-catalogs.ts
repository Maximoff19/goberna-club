import { prisma } from '../lib/prisma';
import { ensureCatalogsSeeded, resolveCountryId, resolveSkillIdByName, resolveSpecialtyId } from '../modules/catalogs/catalogs.service';

async function main() {
  await ensureCatalogsSeeded();

  const profiles = await prisma.consultantProfile.findMany({
    include: {
      skills: true,
    },
  });

  for (const profile of profiles) {
    let nextCountry = profile.country;
    let nextCity = profile.city;
    let resolvedCountryId = await resolveCountryId(profile.country);

    if (!resolvedCountryId) {
      const swappedCountryId = await resolveCountryId(profile.city);
      if (swappedCountryId) {
        resolvedCountryId = swappedCountryId;
        nextCountry = profile.city;
        nextCity = profile.country;
      }
    }

    const resolvedSpecialtyId = await resolveSpecialtyId(profile.professionalHeadline);

    await prisma.consultantProfile.update({
      where: { id: profile.id },
      data: {
        countryId: resolvedCountryId,
        specialtyId: resolvedSpecialtyId,
        country: nextCountry,
        city: nextCity,
      },
    });

    for (const skill of profile.skills) {
      const skillId = await resolveSkillIdByName(skill.name);
      await prisma.profileSkill.update({
        where: { id: skill.id },
        data: { skillId },
      });
    }
  }

  console.log(`Normalized ${profiles.length} profiles against country, specialty and skill catalogs.`);
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

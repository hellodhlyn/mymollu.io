import { User } from "iconoir-react";
import { studentImageUrl } from "~/models/assets";

type ProfileImageProps = {
  studentId: string | null;
  imageSize?: 6 | 8;
};

export default function ProfileImage({ studentId, imageSize }: ProfileImageProps) {
  let [imageSizeClass, iconSizeClass]: string[] = [];
  switch (imageSize) {
    case 6:
      [imageSizeClass, iconSizeClass] = ["h-6 w-6", "h-4 w-4"];
      break;
    case 8:
    default:
      [imageSizeClass, iconSizeClass] = ["h-8 w-8", "h-6 w-6"];
  }

  return studentId ?
    <img className={`${imageSizeClass} rounded-full object-cover`} src={studentImageUrl(studentId)} alt="학생 프로필" /> :
    (
      <div className={`${imageSizeClass} flex items-center justify-center rounded-full border border-neutral-200 text-neutral-700`}>
        <User className={iconSizeClass} strokeWidth={2} />
      </div>
    );
}
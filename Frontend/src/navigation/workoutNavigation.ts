import { ROUTES } from "./routes";

export function returnToMainHome(navigation: {
  reset: (state: {
    index: number;
    routes: { name: string; params: { tab: "home" } }[];
  }) => void;
}) {
  navigation.reset({
    index: 0,
    routes: [{ name: ROUTES.HOME, params: { tab: "home" } }],
  });
}

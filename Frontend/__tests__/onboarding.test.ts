import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNextProfileRoute, getPostAuthRoute } from "../src/utils/onboarding";
import { ROUTES } from "../src/navigation/routes";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const completeProfile = {
  gender: "female",
  age: 25,
  height: 165,
  weight: 60,
  goal: "stay_fit",
};

describe("onboarding route selection", () => {
  it("sends users to the first incomplete profile step", () => {
    expect(getNextProfileRoute({})).toBe(ROUTES.GENDER);
    expect(getNextProfileRoute({ gender: "female" })).toBe(ROUTES.BODY_INFO);
    expect(getNextProfileRoute({ ...completeProfile, goal: "" })).toBe(ROUTES.GOAL);
  });

  it("opens permissions after profile completion until the choice is recorded", async () => {
    jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce(null);
    await expect(getPostAuthRoute(completeProfile)).resolves.toBe(ROUTES.PERMISSIONS);

    jest.mocked(AsyncStorage.getItem).mockResolvedValueOnce("true");
    await expect(getPostAuthRoute(completeProfile)).resolves.toBe(ROUTES.HOME);
  });
});
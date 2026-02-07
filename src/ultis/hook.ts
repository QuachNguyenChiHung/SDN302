import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootDispatch, RootState } from "../store";

export const ChiHungAppDispatch: () => RootDispatch = useDispatch;
export const ChiHungAppSelector: TypedUseSelectorHook<RootState> = useSelector;
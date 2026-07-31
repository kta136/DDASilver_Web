// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductDetailDialog } from "@/components/catalog/product-detail-dialog";

const { back, navigation } = vi.hoisted(() => ({
  back: vi.fn(),
  navigation: { pathname: "/products/braided-silver-bracelet" },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
  usePathname: () => navigation.pathname,
}));

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
});

beforeEach(() => {
  back.mockClear();
  navigation.pathname = "/products/braided-silver-bracelet";
  window.history.replaceState(
    null,
    "",
    "/products/braided-silver-bracelet",
  );
});
afterEach(cleanup);

describe("<ProductDetailDialog />", () => {
  it("opens modally, locks background scroll, and closes through navigation", () => {
    render(
      <ProductDetailDialog
        titleId="dialog-title"
        productPath="/products/braided-silver-bracelet"
      >
        <h2 id="dialog-title">Braided Silver Bracelet</h2>
      </ProductDetailDialog>,
    );

    const dialog = screen.getByRole("dialog", {
      name: "Braided Silver Bracelet",
    });
    expect(dialog).toHaveAttribute("open");
    expect(document.documentElement.style.overflow).toBe("hidden");

    fireEvent.click(
      screen.getByRole("button", { name: "Close product details" }),
    );

    expect(back).toHaveBeenCalledOnce();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("closes when the native dialog receives a cancel event", () => {
    render(
      <ProductDetailDialog
        titleId="dialog-title"
        productPath="/products/braided-silver-bracelet"
      >
        <h2 id="dialog-title">Silver Coin</h2>
      </ProductDetailDialog>,
    );

    fireEvent(
      screen.getByRole("dialog", { name: "Silver Coin" }),
      new Event("cancel", { cancelable: true }),
    );

    expect(back).toHaveBeenCalledOnce();
  });

  it("closes and reopens when browser history changes", () => {
    render(
      <ProductDetailDialog
        titleId="dialog-title"
        productPath="/products/braided-silver-bracelet"
      >
        <h2 id="dialog-title">Braided Silver Bracelet</h2>
      </ProductDetailDialog>,
    );

    const dialog = screen.getByRole("dialog", {
      name: "Braided Silver Bracelet",
    });
    window.history.pushState(null, "", "/products");
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(dialog).not.toHaveAttribute("open");
    expect(document.documentElement.style.overflow).toBe("");

    window.history.pushState(
      null,
      "",
      "/products/braided-silver-bracelet",
    );
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(dialog).toHaveAttribute("open");
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("reopens when a new client-side link transition selects the product", () => {
    navigation.pathname = "/products";
    window.history.replaceState(null, "", "/products");
    const view = render(
      <ProductDetailDialog
        titleId="dialog-title"
        productPath="/products/braided-silver-bracelet"
      >
        <h2 id="dialog-title">Braided Silver Bracelet</h2>
      </ProductDetailDialog>,
    );

    const dialog = document.querySelector("dialog")!;
    expect(dialog).not.toHaveAttribute("open");

    navigation.pathname = "/products/braided-silver-bracelet";
    view.rerender(
      <ProductDetailDialog
        titleId="dialog-title"
        productPath="/products/braided-silver-bracelet"
      >
        <h2 id="dialog-title">Braided Silver Bracelet</h2>
      </ProductDetailDialog>,
    );

    expect(dialog).toHaveAttribute("open");
    expect(document.documentElement.style.overflow).toBe("hidden");
  });
});

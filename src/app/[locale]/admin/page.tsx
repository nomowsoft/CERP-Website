import { Invoicing } from "./snipptes/invoicing";
import { KpiCard } from "./snipptes/kpicard";
import { ShowDownload } from "./snipptes/show_download";

export default async function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">لوحة اللمعلومات</h1>
                <p className="text-slate-500 mt-1">نظرة عامة على لوحة المعلومات</p>
            </div>
            <KpiCard />
            <Invoicing />
            <ShowDownload />
        </div>
    );
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonList, IonItem, IonIcon, IonLabel, IonButton,
  IonModal, IonInput, IonSelect, IonSelectOption,
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonToast, IonSearchbar, IonSkeletonText, IonCard, IonCardContent, IonBadge
} from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { Inventario } from '../../models/inventario';
import { InventarioService, CreateInventarioDto, UpdateInventarioDto } from '../../services/inventario.service';

import { Proveedor } from '../../models/proveedor';
import { ProveedorService, CreateProveedorDto, UpdateProveedorDto } from '../../services/proveedor.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss'],
  imports: [
    CommonModule, ReactiveFormsModule,
    IonList, IonItem, IonIcon, IonLabel, IonButton,
    IonModal, IonInput, IonSelect, IonSelectOption,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonToast, IonSearchbar, IonSkeletonText, IonCard, IonCardContent, IonBadge
  ],
})
export class InventarioComponent implements OnInit {
  private invSrv = inject(InventarioService);
  private provSrv = inject(ProveedorService);
  private fb = inject(FormBuilder);

  /* ---------- Inventario ---------- */
  inventario: Inventario[] = [];
  loading = true;
  error = false;
  query = '';

  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  form!: FormGroup;

  toastMsg = '';
  showToast = false;

  /* ---------- Proveedores ---------- */
  proveedores: Proveedor[] = [];
  loadingProv = true;
  errorProv = false;
  queryProv = '';

  // modal proveedores
  showProvModal = false;
  isEditingProv = false;
  editingProvId: number | null = null;
  provForm!: FormGroup;

  ngOnInit() {
    this.buildForm();
    this.buildProvForm();
    this.load();
    this.loadProveedores();
  }

  /* ====== Inventario ====== */
  private buildForm() {
    this.form = this.fb.group({
      nombreInsumo: ['', [Validators.required, Validators.maxLength(160)]],
      cantidad: [0, [Validators.required, Validators.min(0)]],
      unidad: ['pza', [Validators.required]],
    });
  }

  load() {
    this.loading = true; this.error = false;
    this.invSrv.getAllInventario().subscribe({
      next: (data) => {
        this.inventario = (data ?? []).sort((a,b) =>
          a.nombreInsumo.localeCompare(b.nombreInsumo) || a.unidad.localeCompare(b.unidad)
        );
        this.loading = false;
      },
      error: () => { this.error = true; this.loading = false; }
    });
  }
  reload() { this.load(); }

  onSearch(q: string) { this.query = (q || '').trim().toLowerCase(); }
  get listaFiltrada(): Inventario[] {
    if (!this.query) return this.inventario;
    const q = this.query;
    return this.inventario.filter(i =>
      (i.nombreInsumo || '').toLowerCase().includes(q) ||
      (i.unidad || '').toLowerCase().includes(q) ||
      String(i.cantidad).includes(q)
    );
  }

  abrirNuevo() {
    this.isEditing = false;
    this.editingId = null;
    this.form.reset({ nombreInsumo: '', cantidad: 0, unidad: 'pza' });
    this.showModal = true;
  }

  abrirEditar(i: Inventario) {
    this.isEditing = true;
    this.editingId = i.id;
    this.form.setValue({
      nombreInsumo: i.nombreInsumo ?? '',
      cantidad: i.cantidad ?? 0,
      unidad: i.unidad ?? 'pza',
    });
    this.showModal = true;
  }

  cerrarModal() { this.showModal = false; }

  guardar() {
    if (this.form.invalid) return;
    const body = this.form.value as CreateInventarioDto;

    if (this.isEditing) {
      if (this.editingId == null) return;
      this.invSrv.updateInventario(this.editingId, body as UpdateInventarioDto).subscribe({
        next: (upd) => {
          const idx = this.inventario.findIndex(x => x.id === upd.id);
          if (idx > -1) this.inventario[idx] = upd;
          this.inventario = [...this.inventario].sort((a,b) =>
            a.nombreInsumo.localeCompare(b.nombreInsumo) || a.unidad.localeCompare(b.unidad)
          );
          this.toast('Insumo actualizado');
          this.cerrarModal();
        },
        error: () => this.toast('Error al actualizar'),
      });
    } else {
      this.invSrv.createInventario(body).subscribe({
        next: (created) => {
          this.inventario = [created, ...this.inventario].sort((a,b) =>
            a.nombreInsumo.localeCompare(b.nombreInsumo) || a.unidad.localeCompare(b.unidad)
          );
          this.toast('Insumo creado');
          this.cerrarModal();
        },
        error: () => this.toast('Error al crear'),
      });
    }
  }

  eliminar(i: Inventario) {
    if (!confirm(`¿Eliminar "${i.nombreInsumo}"?`)) return;
    this.invSrv.deleteInventario(i.id).subscribe({
      next: () => {
        this.inventario = this.inventario.filter(x => x.id !== i.id);
        this.toast('Insumo eliminado');
      },
      error: () => this.toast('Error al eliminar'),
    });
  }

  private toast(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 1600);
  }

  trackById(_i: number, it: Inventario) { return it.id; }

  /* ====== Proveedores ====== */
  private buildProvForm() {
    this.provForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(160)]],
      telefono: ['', [Validators.required, Validators.maxLength(40)]],
      correoProveedor: ['', [Validators.required, Validators.email, Validators.maxLength(160)]],
    });
  }

  loadProveedores() {
    this.loadingProv = true; this.errorProv = false;
    this.provSrv.getAllProveedores().subscribe({
      next: (list) => {
        this.proveedores = (list ?? []).sort((a,b) => a.nombre.localeCompare(b.nombre));
        this.loadingProv = false;
      },
      error: () => { this.errorProv = true; this.loadingProv = false; }
    });
  }
  reloadProv() { this.loadProveedores(); }

  onSearchProv(q: string) { this.queryProv = (q || '').trim().toLowerCase(); }
  get proveedoresFiltrados(): Proveedor[] {
    if (!this.queryProv) return this.proveedores;
    const q = this.queryProv;
    return this.proveedores.filter(p =>
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.correoProveedor || '').toLowerCase().includes(q) ||
      (p.telefono || '').toLowerCase().includes(q)
    );
  }

  abrirNuevoProv() {
    this.isEditingProv = false;
    this.editingProvId = null;
    this.provForm.reset({ nombre: '', telefono: '', correoProveedor: '' });
    this.showProvModal = true;
  }

  abrirEditarProv(p: Proveedor) {
    this.isEditingProv = true;
    this.editingProvId = p.id;
    this.provForm.setValue({
      nombre: p.nombre ?? '',
      telefono: p.telefono ?? '',
      correoProveedor: p.correoProveedor ?? '',
    });
    this.showProvModal = true;
  }

  cerrarProvModal() { this.showProvModal = false; }

  guardarProv() {
    if (this.provForm.invalid) return;
    const body = this.provForm.value as CreateProveedorDto;

    if (this.isEditingProv) {
      if (this.editingProvId == null) return;
      this.provSrv.updateProveedor(this.editingProvId, body as UpdateProveedorDto).subscribe({
        next: (upd) => {
          const idx = this.proveedores.findIndex(x => x.id === upd.id);
          if (idx > -1) this.proveedores[idx] = upd;
          this.proveedores = [...this.proveedores].sort((a,b)=>a.nombre.localeCompare(b.nombre));
          this.toast('Proveedor actualizado');
          this.cerrarProvModal();
        },
        error: () => this.toast('Error al actualizar proveedor'),
      });
    } else {
      this.provSrv.createProveedor(body).subscribe({
        next: (created) => {
          this.proveedores = [created, ...this.proveedores].sort((a,b)=>a.nombre.localeCompare(b.nombre));
          this.toast('Proveedor creado');
          this.cerrarProvModal();
        },
        error: () => this.toast('Error al crear proveedor'),
      });
    }
  }

  eliminarProv(p: Proveedor) {
    if (!confirm(`¿Eliminar al proveedor "${p.nombre}"?`)) return;
    this.provSrv.deleteProveedor(p.id).subscribe({
      next: () => {
        this.proveedores = this.proveedores.filter(x => x.id !== p.id);
        this.toast('Proveedor eliminado');
      },
      error: () => this.toast('Error al eliminar proveedor'),
    });
  }
}
